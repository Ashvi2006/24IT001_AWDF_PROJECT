const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { taskValidationRules, validate } = require('../middleware/validate');
const taskEmitter = require('../events/taskEmitter');

// ─── Week 9: In-Memory Caching (node-cache) ───
// Initialize in-memory cache with standard TTL of 600 seconds (10 minutes)
const taskCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const TASKS_CACHE_KEY = 'all_tasks';

// Invalidation helper to clear cache on write operations (POST, PUT, DELETE)
const invalidateCache = () => {
  const keysDeleted = taskCache.del(TASKS_CACHE_KEY);
  if (keysDeleted > 0) {
    console.log(`🧹 [Cache Invalidation] Cleared '${TASKS_CACHE_KEY}' from node-cache`);
  }
  return keysDeleted;
};

// ─── Week 10: Async EventEmitter Notification Endpoints ───
// GET /api/tasks/notifications - Get background async notification log
router.get('/notifications', (req, res) => {
  const notifications = taskEmitter.getRecentNotifications();
  res.json({
    total: notifications.length,
    notifications
  });
});

// DELETE /api/tasks/notifications - Clear background notifications
router.delete('/notifications', (req, res) => {
  taskEmitter.clearNotifications();
  res.json({ message: 'Async notification buffer cleared' });
});

// POST /api/tasks/test-event - Dispatch an async test event for demonstration
router.post('/test-event', (req, res) => {
  const apiEmittedAt = new Date().toISOString();
  const testTitle = req.body.title || `Async Task #${Math.floor(Math.random() * 900 + 100)}`;
  const testUser = req.body.user || 'Ashvi Antala (24IT001)';
  const priority = req.body.priority || 'High';

  setImmediate(() => {
    taskEmitter.emit('task:created', {
      _id: `test_${Date.now()}`,
      title: testTitle,
      priority,
      user: testUser,
      apiEmittedAt,
      simulatedDelayMs: 400
    });
  });

  res.status(201).json({
    message: 'Event dispatched asynchronously to background listener',
    apiEmittedAt,
    title: testTitle,
    user: testUser
  });
});

// ─── Week 9: Cache Inspection & Clearing Endpoints ───
// GET /api/tasks/cache-stats - Get in-memory cache statistics
router.get('/cache-stats', (req, res) => {
  const stats = taskCache.getStats();
  const keys = taskCache.keys();
  const isCached = taskCache.has(TASKS_CACHE_KEY);
  const ttl = taskCache.getTtl(TASKS_CACHE_KEY);
  const ttlRemaining = ttl ? Math.max(0, Math.round((ttl - Date.now()) / 1000)) : 0;

  res.json({
    cached: isCached,
    keys,
    stats,
    ttlRemaining: `${ttlRemaining}s`
  });
});

// POST /api/tasks/clear-cache - Manual cache clear endpoint
router.post('/clear-cache', (req, res) => {
  invalidateCache();
  res.json({ message: 'In-memory node-cache successfully cleared', cached: false });
});

// ─── Week 4, 5, 6, 9: GET /api/tasks - Get all tasks with In-Memory Caching ───
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const forceNoCache = req.query.nocache === 'true';

  try {
    // Check if tasks exist in in-memory cache and nocache is not forced
    if (!forceNoCache && taskCache.has(TASKS_CACHE_KEY)) {
      const cachedTasks = taskCache.get(TASKS_CACHE_KEY);
      const responseTime = Math.max(1, Date.now() - startTime);

      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      return res.json(cachedTasks);
    }

    // Cache MISS: Query MongoDB database
    const tasks = await Task.find().sort({ createdAt: -1 });
    const responseTime = Math.max(1, Date.now() - startTime);

    // Save in node-cache if caching is not explicitly bypassed
    if (!forceNoCache) {
      taskCache.set(TASKS_CACHE_KEY, tasks);
    }

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    return res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tasks', error: error.message });
  }
});

// ─── Week 4, 5, 6, 7, 9, 10: POST /api/tasks - Create a new task ───
router.post('/', taskValidationRules, validate, async (req, res) => {
  try {
    const { title, description, priority, assignedUser } = req.body;
    const task = new Task({ title, description, priority });
    const savedTask = await task.save();

    // Week 9: Invalidate cache on write
    invalidateCache();

    // ─── Week 10: Native EventEmitter Asynchronous Processing ───
    const apiEmittedAt = new Date().toISOString();
    console.log(`\n⚡ [ SYNC API RESPONSE] Returning HTTP 201 for "${savedTask.title}" at ${apiEmittedAt}`);

    // Asynchronously emit event without awaiting its background completion
    setImmediate(() => {
      taskEmitter.emit('task:created', {
        _id: savedTask._id,
        taskId: savedTask._id,
        title: savedTask.title,
        description: savedTask.description,
        priority: savedTask.priority,
        user: assignedUser || req.user?.username || 'Ashvi (Student)',
        apiEmittedAt
      });
    });

    // Main API response returns IMMEDIATELY without waiting for background event handler
    const responseData = savedTask.toObject();
    responseData._asyncNotification = {
      event: 'task:created',
      apiEmittedAt,
      status: 'dispatched_asynchronously'
    };

    res.status(201).json(responseData);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error creating task', error: error.message });
  }
});

// ─── Week 4, 5, 6, 7, 9: PUT /api/tasks/:id - Update a task ───
router.put('/:id', taskValidationRules, validate, async (req, res) => {
  try {
    const { title, description, priority, completed } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, completed },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Week 9: Invalidate cache on write
    invalidateCache();

    res.json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error updating task', error: error.message });
  }
});

// ─── Week 4, 5, 6, 7, 9: DELETE /api/tasks/:id - Delete a task ───
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Week 9: Invalidate cache on write
    invalidateCache();

    res.json({ message: 'Task deleted successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting task', error: error.message });
  }
});

module.exports = router;
