const EventEmitter = require('events');

/**
 * Week 10: Asynchronous Processing with Event-Driven Architecture
 * Implemented using Node.js native EventEmitter without external dependencies.
 */
class TaskEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.maxNotifications = 50;

    const baseTime = Date.now() - 1000 * 60 * 3;
    const t0 = new Date(baseTime).toISOString();
    const t1 = new Date(baseTime + 8).toISOString();
    const t2 = new Date(baseTime + 418).toISOString();

    // In-memory buffer initialized with realistic baseline demonstration events
    this.notifications = [
      {
        id: 'notif_init_demo_1',
        taskId: '67a89f10b23e',
        taskTitle: 'Setup MongoDB Mongoose & Auth Middleware',
        priority: 'High',
        user: 'Ashvi Antala (24IT001)',
        apiEmittedAt: t0,
        handlerStartedAt: t1,
        handlerCompletedAt: t2,
        executionDeltaMs: 410,
        simulatedAsyncDelay: 400,
        status: 'Processed asynchronously in background',
        message: 'Task "Setup MongoDB Mongoose & Auth Middleware" notification dispatched to Ashvi Antala without blocking API response.'
      }
    ];

    // Register asynchronous background listener for 'task:created'
    this.on('task:created', this.handleTaskCreated.bind(this));
  }

  /**
   * Asynchronous event handler for 'task:created'
   * Executes in the background without blocking the main Express API response.
   */
  handleTaskCreated(payload) {
    const handlerStartedAt = new Date().toISOString();
    const startTimeMs = Date.now();

    console.log('\n============================================================');
    console.log('🔔 [ASYNC EVENT] Received "task:created" event');
    console.log(`📌 Task Title: "${payload.title}" (ID: ${payload._id || payload.taskId || 'new'})`);
    console.log(`👤 Assigned User: ${payload.user || 'Ashvi (Student)'}`);
    console.log(`⚡ API Response Returned At:  ${payload.apiEmittedAt}`);
    console.log(`🕒 Background Handler Started: ${handlerStartedAt}`);

    // Non-blocking asynchronous background execution simulation (e.g., email notification, audit logging)
    // Using setTimeout / setImmediate to guarantee asynchronous background execution
    const simulatedAsyncDelay = payload.simulatedDelayMs || 400;

    setTimeout(() => {
      const handlerCompletedAt = new Date().toISOString();
      const endTimeMs = Date.now();
      const executionDeltaMs = endTimeMs - startTimeMs;

      const notificationRecord = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        taskId: payload._id || payload.taskId,
        taskTitle: payload.title,
        priority: payload.priority || 'Medium',
        user: payload.user || 'Ashvi (Student)',
        apiEmittedAt: payload.apiEmittedAt,
        handlerStartedAt,
        handlerCompletedAt,
        executionDeltaMs,
        simulatedAsyncDelay,
        status: 'Processed asynchronously in background',
        message: `Task "${payload.title}" notification dispatched to ${payload.user || 'Ashvi'} without blocking API response.`
      };

      // Store in memory for UI observability
      this.notifications.unshift(notificationRecord);
      if (this.notifications.length > this.maxNotifications) {
        this.notifications.pop();
      }

      console.log(`✅ [ ASYNC EVENT COMPLETE] Finished at ${handlerCompletedAt}`);
      console.log(`⏱️ Handler processing time: ${executionDeltaMs}ms (Non-blocking execution)`);
      console.log('============================================================\n');

      // Emit a completion event for optional subscribers or webhooks
      this.emit('task:notification-dispatched', notificationRecord);
    }, simulatedAsyncDelay);
  }

  getRecentNotifications() {
    return this.notifications;
  }

  clearNotifications() {
    this.notifications = [];
    return true;
  }
}

// Singleton instance
const taskEmitter = new TaskEventEmitter();

module.exports = taskEmitter;
