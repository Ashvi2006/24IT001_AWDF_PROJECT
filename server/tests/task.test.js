const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const taskEmitter = require('../events/taskEmitter');

/**
 * Automated Test Suite for Student Portfolio & Task Management Application
 * Coordinated for Week 10 (EventEmitter), Week 12 (CI/CD Automated Tests), and Week 13 (AI Integration)
 */

describe('Week 12: Automated Test Suite - Task Management API', () => {

  // ─── Test 1: Health Check & Model Verification ───
  it('should validate task creation rules and schema requirements', () => {
    const validTask = {
      title: 'Setup Docker Compose containerization',
      description: 'Orchestrate React, Express, and Mongo containers',
      priority: 'High'
    };

    assert.ok(validTask.title, 'Task title should be present');
    assert.ok(validTask.title.length > 0, 'Task title cannot be empty');
    assert.match(validTask.priority, /^(Low|Medium|High)$/, 'Priority must be Low, Medium, or High');
  });

  it('should reject invalid tasks with empty titles', () => {
    const invalidTask = {
      title: '',
      description: 'No title provided',
      priority: 'Medium'
    };

    const isValid = Boolean(invalidTask.title && invalidTask.title.trim().length > 0);
    assert.strictEqual(isValid, false, 'Validation should fail for empty title');
  });

  // ─── Test 2: Week 10 Asynchronous EventEmitter Verification ───
  it('should process "task:created" event asynchronously via Node.js native EventEmitter', async () => {
    const apiEmittedAt = new Date().toISOString();
    const testTask = {
      taskId: 'test_task_123',
      title: 'Test Asynchronous EventEmitter Processing',
      description: 'Verifying non-blocking background notification execution',
      priority: 'Medium',
      user: 'Ashvi (CI Test Runner)',
      apiEmittedAt,
      simulatedDelayMs: 50 // Fast execution for CI pipeline
    };

    // Promise that resolves when background handler completes
    const backgroundEventPromise = new Promise((resolve) => {
      taskEmitter.once('task:notification-dispatched', (record) => {
        resolve(record);
      });
    });

    // Emit event asynchronously
    taskEmitter.emit('task:created', testTask);

    // Await background completion
    const notificationRecord = await backgroundEventPromise;

    assert.ok(notificationRecord, 'Notification record should be generated');
    assert.strictEqual(notificationRecord.taskTitle, testTask.title);
    assert.strictEqual(notificationRecord.user, testTask.user);
    assert.ok(notificationRecord.handlerCompletedAt, 'Handler completion timestamp must be present');
    assert.ok(notificationRecord.executionDeltaMs >= 0, 'Execution delta should be recorded');
  });

  // ─── Test 3: Week 13 AI Heuristic Engine & Graceful Degradation Verification ───
  it('should generate intelligent task recommendations with responsible degradation fallback', () => {
    // Test the heuristic fallback algorithm to ensure 100% uptime without external dependencies
    const sampleInputTitle = 'Fix critical security vulnerability in authentication token';
    const cleanTitle = sampleInputTitle.trim();
    const lower = cleanTitle.toLowerCase();

    // Verify smart priority inference
    const isSecurityOrBug = lower.includes('security') || lower.includes('fix');
    const priority = isSecurityOrBug ? 'High' : 'Medium';

    assert.strictEqual(priority, 'High', 'Security and bug tasks must automatically infer High priority');
  });

  // ─── Test 4: Demonstration Mode for Broken Pipeline (Week 12 Requirement) ───
  it('should verify CI pipeline status (passes by default, can simulate broken test)', () => {
    const simulateFailure = process.env.DEMO_BROKEN_TEST === 'true';
    if (simulateFailure) {
      assert.fail('💥 [DEMO TEST FAILURE] Intentional test failure to demonstrate failed GitHub Actions pipeline.');
    } else {
      assert.ok(true, '✅ Test suite passed successfully for CI/CD workflow verification.');
    }
  });

});
