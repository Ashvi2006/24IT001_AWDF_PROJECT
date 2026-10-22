const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { taskValidationRules, validate } = require('../middleware/validate');
const taskEmitter = require('../events/taskEmitter');

// Initialize node-cache (TTL: 600 seconds = 10 minutes)
const taskCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const TASKS_CACHE_KEY = 'all_tasks';

// Helper function to invalidate tasks cache
const invalidateCache = () => {
  const keysDeleted = taskCache.del(TASKS_CACHE_KEY);
  if (keysDeleted > 0) {
    console.log(`🧹 [Cache Invalidation] Successfully cleared '${TASKS_CACHE_KEY}' from node-cache`);
  }
  return keysDeleted;
};

// Week 10: GET /api/tasks/notifications - Get background async notification log
router.get('/notifications', (req, res) => {
  const notifications = taskEmitter.getRecentNotifications();
  res.json({
    total: notifications.length,
    notifications
  });
});

// Week 10: DELETE /api/tasks/notifications - Clear background notifications
router.delete('/notifications', (req, res) => {
  taskEmitter.clearNotifications();
  res.json({ message: 'Async notification buffer cleared' });
});

// GET /api/tasks/cache-stats - Get in-memory cache statistics
router.get('/cache-stats', (req, res) => {
  const stats = taskCache.getStats();
  const keys = taskCache.keys();
  res.json({
    cached: taskCache.has(TASKS_CACHE_KEY),
    keys,
    stats,
    ttl: taskCache.getTtl(TASKS_CACHE_KEY) ? Math.round((taskCache.getTtl(TASKS_CACHE_KEY) - Date.now()) / 1000) : 0
  });
});

// POST /api/tasks/clear-cache - Manual cache clear endpoint for benchmarking
router.post('/clear-cache', (req, res) => {
  invalidateCache();
  res.json({ message: 'Task cache manually cleared', cached: false });
});

// GET /api/tasks - Get all tasks (with node-cache in-memory caching)
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const forceNoCache = req.query.nocache === 'true';

  try {
    // Check if tasks exist in cache and nocache flag is not passed
    if (!forceNoCache && taskCache.has(TASKS_CACHE_KEY)) {
      const cachedTasks = taskCache.get(TASKS_CACHE_KEY);
      const responseTime = Date.now() - startTime;

      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      
      return res.json({
        data: cachedTasks,
        source: 'cache',
        cacheHeader: 'X-Cache: HIT',
        responseTime: `${responseTime} ms`
      });
    }

    // Cache MISS: Fetch from MongoDB database
    const tasks = await Task.find().sort({ createdAt: -1 });
    const responseTime = Date.now() - startTime;

    // Store in node-cache if not forced no-cache
    if (!forceNoCache) {
      taskCache.set(TASKS_CACHE_KEY, tasks);
    }

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time', `${responseTime}ms`);

    res.json({
      data: tasks,
      source: forceNoCache ? 'nocache_bypassed' : 'database',
      cacheHeader: 'X-Cache: MISS',
      responseTime: `${responseTime} ms`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tasks', error: error.message });
  }
});

// POST /api/tasks - Create a new task (Week 10: Emits task:created event asynchronously)
router.post('/', taskValidationRules, validate, async (req, res) => {
  try {
    const { title, description, priority, assignedUser } = req.body;
    const task = new Task({ title, description, priority });
    const savedTask = await task.save();

    // Invalidate cache on write
    invalidateCache();

    // ─── Week 10: Native EventEmitter Asynchronous Processing ───
    const apiEmittedAt = new Date().toISOString();
    console.log(`\n⚡ [WEEK 10 SYNC API RESPONSE] Returning HTTP 201 for "${savedTask.title}" at ${apiEmittedAt}`);
    
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

    // Main API response returns IMMEDIATELY without waiting for event handler
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

// PUT /api/tasks/:id - Update a task (Invalidates Cache)
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

    // Invalidate cache on write
    invalidateCache();

    res.json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error updating task', error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete a task (Invalidates Cache)
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Invalidate cache on write
    invalidateCache();

    res.json({ message: 'Task deleted successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting task', error: error.message });
  }
});

module.exports = router;

