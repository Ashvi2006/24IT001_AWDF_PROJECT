const EventEmitter = require('events');

/**
 * Week 10: Asynchronous Processing with Event-Driven Architecture
 * Implemented using Node.js native EventEmitter without external dependencies.
 */
class TaskEventEmitter extends EventEmitter {
  constructor() {
    super();
    // In-memory buffer to store recent background notification events
    this.notifications = [];
    this.maxNotifications = 50;

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
    console.log('🔔 [WEEK 10 ASYNC EVENT] Received "task:created" event');
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

      console.log(`✅ [WEEK 10 ASYNC EVENT COMPLETE] Finished at ${handlerCompletedAt}`);
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
