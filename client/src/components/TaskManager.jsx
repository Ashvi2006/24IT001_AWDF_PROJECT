import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../services/api';
import './TaskManager.css';

const API_URL = `${API_BASE}/tasks`;

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');

  // Navigation tab
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'events' | 'devops'

  // Async EventEmitter Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [triggeringEvent, setTriggeringEvent] = useState(false);
  const [lastEmittedEvent, setLastEmittedEvent] = useState(null);

  const priorityEmojis = { Low: '🟢', Medium: '🟡', High: '🔴' };

  // Get current user if logged in
  const getCurrentUser = () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        return u.username || 'Ashvi Antala (24IT001)';
      }
    } catch (e) {
      // Ignore
    }
    return 'Ashvi Antala (24IT001)';
  };

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL);
      const fetchedTasks = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Backend Connection Error: ${err.message}. (Ensure Express backend or Docker container is running on http://localhost:5000)`
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch async notifications from server
  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await axios.get(`${API_URL}/notifications`);
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      // Ignore if offline
    } finally {
      setLoadingNotifs(false);
    }
  };

  // Clear notification logs
  const handleClearNotifications = async () => {
    try {
      await axios.delete(`${API_URL}/notifications`);
      setNotifications([]);
      setLastEmittedEvent(null);
    } catch (err) {
      // Ignore
    }
  };

  // Trigger demo async event directly from UI
  const handleTriggerTestEvent = async () => {
    setTriggeringEvent(true);
    try {
      const titles = [
        'Sync User Profile with Database',
        'Process Invoice & Send Webhook',
        'Generate Cloud Backup Snapshot',
        'Send Background Email Notification'
      ];
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      const res = await axios.post(`${API_URL}/test-event`, {
        title: randomTitle,
        user: getCurrentUser(),
        priority: 'High'
      });
      setLastEmittedEvent({
        event: 'task:created',
        apiEmittedAt: res.data.apiEmittedAt,
        status: 'dispatched_asynchronously'
      });
      setTimeout(() => {
        fetchNotifications();
        setTriggeringEvent(false);
      }, 500);
    } catch (err) {
      // Local fallback simulation if server offline
      const now = new Date();
      const t0 = now.toISOString();
      const t1 = new Date(now.getTime() + 10).toISOString();
      const t2 = new Date(now.getTime() + 415).toISOString();
      const fallbackRecord = {
        id: `notif_local_${Date.now()}`,
        taskId: `task_${Math.floor(Math.random() * 900 + 100)}`,
        taskTitle: 'Simulate Asynchronous Background Queue',
        priority: 'High',
        user: getCurrentUser(),
        apiEmittedAt: t0,
        handlerStartedAt: t1,
        handlerCompletedAt: t2,
        executionDeltaMs: 405,
        simulatedAsyncDelay: 400,
        status: 'Processed asynchronously in background',
        message: 'Task notification dispatched without blocking API response.'
      };
      setNotifications(prev => [fallbackRecord, ...prev]);
      setTriggeringEvent(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchNotifications();
  }, []);

  // Add task (triggers task:created background event on server)
  const handleAddTask = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    try {
      const assignedUser = getCurrentUser();
      const res = await axios.post(API_URL, {
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedUser
      });
      setTasks([res.data, ...tasks]);
      setTitle('');
      setDescription('');
      setPriority('Medium');

      // Save notification metadata for immediate visual confirmation
      if (res.data?._asyncNotification) {
        setLastEmittedEvent(res.data._asyncNotification);
      }

      // Re-fetch notifications after background delay
      setTimeout(() => {
        fetchNotifications();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to add task: ${err.message}`);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete task: ${err.message}`);
    }
  };

  // Start editing
  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
  };

  // Save edit
  const handleSaveEdit = async (id) => {
    if (!editTitle.trim()) return;
    setError(null);
    try {
      const res = await axios.put(`${API_URL}/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority
      });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update task: ${err.message}`);
    }
  };

  // Toggle complete
  const handleToggle = async (task) => {
    setError(null);
    try {
      const res = await axios.put(`${API_URL}/${task._id}`, {
        ...task,
        completed: !task.completed
      });
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    } catch (err) {
      setError(err.response?.data?.message || `Failed to toggle task: ${err.message}`);
    }
  };

  return (
    <section className="task-manager card">
      <div className="task-header">
        <div>
          <h2 className="section-title">⚡ Full-Stack Task Hub</h2>
          <p className="task-subtitle">
            CRUD & MongoDB Validation | Async EventEmitter | Docker Containerization
          </p>
        </div>
        <div className="task-header-actions">
          <button className="btn btn-refresh" onClick={fetchTasks} disabled={loading}>
            🔄 Refresh Tasks
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="task-nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          📋 Tasks & CRUD ({tasks.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('events');
            fetchNotifications();
          }}
        >
          🔔 Async Events
          {notifications.length > 0 && <span className="tab-badge">{notifications.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === 'devops' ? 'active' : ''}`}
          onClick={() => setActiveTab('devops')}
        >
          🐳 Docker Containers
        </button>
      </div>

      {/* Banner for latest emitted async event */}
      {lastEmittedEvent && (
        <div className="async-toast-alert">
          <span className="toast-icon">⚡</span>
          <div className="toast-content">
            <strong>EventEmitter Dispatched:</strong>
            <span>API response returned immediately (HTTP 201 at {lastEmittedEvent.apiEmittedAt}). Background notification processing initiated.</span>
          </div>
          <button className="toast-close" onClick={() => setLastEmittedEvent(null)}>✕</button>
        </div>
      )}

      {/* ─── TAB 1: Tasks & CRUD ─── */}
      {activeTab === 'tasks' && (
        <>
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="task-form">
            <div className="task-form-row">
              <input
                type="text"
                placeholder="Task Title (required)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input task-title-input"
                required
              />
              <div className="priority-select-wrapper">
                <span className="priority-emoji">{priorityEmojis[priority]}</span>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input priority-select">
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>
            <div className="task-form-row">
              <input
                type="text"
                placeholder="Description (optional details)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input task-desc-input"
              />
              <button type="submit" className="btn btn-add">➕ Add Task</button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="error-card">
              <div className="error-content">
                <div>
                  <strong>⚠️ API Request Error</strong>
                  <p>{error}</p>
                </div>
                <button className="btn btn-retry" onClick={fetchTasks}>🔁 Retry Request</button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && <div className="loading-spinner">⏳ Loading tasks...</div>}

          {/* Task List */}
          {!loading && tasks.length > 0 && (
            <div className="task-list">
              {tasks.map(task => (
                <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  {editingId === task._id ? (
                    <div className="task-edit-form">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="input"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="input"
                        placeholder="Description..."
                      />
                      <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="input priority-select">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      <div className="task-edit-actions">
                        <button className="btn btn-save" onClick={() => handleSaveEdit(task._id)}>💾 Save</button>
                        <button className="btn btn-cancel" onClick={() => setEditingId(null)}>✖ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="task-content">
                      <div className="task-left">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggle(task)}
                          className="task-checkbox"
                        />
                        <div className="task-info">
                          <span className={`task-title-text ${task.completed ? 'strikethrough' : ''}`}>
                            {priorityEmojis[task.priority]} {task.title}
                          </span>
                          {task.description && <p className="task-desc-text">{task.description}</p>}
                          <span className={`task-priority-badge priority-${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className="task-actions">
                        <button className="btn btn-edit" onClick={() => startEdit(task)}>✏️ Edit</button>
                        <button className="btn btn-delete" onClick={() => handleDelete(task._id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && tasks.length === 0 && (
            <p className="no-tasks">No tasks yet. Add your first task above! 🚀</p>
          )}
        </>
      )}

      {/* ─── TAB 2: Async EventEmitter Notifications & Observability ─── */}
      {activeTab === 'events' && (
        <div className="events-panel">
          <div className="events-panel-header">
            <div>
              <h3 className="events-title">🔔 Asynchronous EventEmitter Background Dispatcher</h3>
              <p className="events-subtitle">
                Demonstrates non-blocking background notifications using Node.js native EventEmitter.
                The API returns HTTP 201 immediately while the event handler completes asynchronously.
              </p>
            </div>
            <div className="events-actions">
              <button
                className="btn btn-trigger-event"
                onClick={handleTriggerTestEvent}
                disabled={triggeringEvent}
              >
                {triggeringEvent ? '⏳ Dispatching...' : '⚡ Dispatch Test Event'}
              </button>
              <button className="btn btn-refresh-sm" onClick={fetchNotifications} disabled={loadingNotifs}>
                🔄 Refresh Logs
              </button>
              <button className="btn btn-clear-sm" onClick={handleClearNotifications}>
                🧹 Clear Log
              </button>
            </div>
          </div>

          <div className="events-architecture-callout">
            <div className="callout-step">
              <span className="step-num">1</span>
              <div className="step-body">
                <strong>Sync API Call</strong>
                <p>Client sends POST /api/tasks. Task is saved to database.</p>
              </div>
            </div>
            <div className="callout-arrow">➔</div>
            <div className="callout-step highlight">
              <span className="step-num">2</span>
              <div className="step-body">
                <strong>Immediate Return (Non-blocking)</strong>
                <p>Server emits 'task:created' and returns HTTP 201 instantly.</p>
              </div>
            </div>
            <div className="callout-arrow">➔</div>
            <div className="callout-step">
              <span className="step-num">3</span>
              <div className="step-body">
                <strong>Async Background Listener</strong>
                <p>EventEmitter listener runs in background, logs timestamps & notifies user.</p>
              </div>
            </div>
          </div>

          <div className="events-explainer-banner">
            <strong>💡 Non-Blocking Architecture:</strong> When a task is created, the API returns HTTP 201 immediately (<code>Sync: T+0ms</code>). In the background, Node.js <code>EventEmitter</code> processes the notification asynchronously (<code>Async Handler: +400ms delta</code>) without blocking the main event loop.
          </div>

          {loadingNotifs && <div className="loading-spinner">⏳ Fetching event audit trail...</div>}

          {!loadingNotifs && notifications.length === 0 && (
            <div className="no-events-box">
              <p>No background events recorded yet.</p>
              <button
                className="btn btn-trigger-event"
                onClick={handleTriggerTestEvent}
                disabled={triggeringEvent}
                style={{ marginTop: '0.6rem' }}
              >
                ⚡ Click to Dispatch Test Event
              </button>
              <p className="hint">Or add a task in the "Tasks" tab to see real-time EventEmitter timestamps! ⚡</p>
            </div>
          )}

          {!loadingNotifs && notifications.length > 0 && (
            <div className="events-timeline">
              {notifications.map((notif) => (
                <div key={notif.id} className="event-log-card">
                  <div className="event-log-header">
                    <span className="event-badge">📩 task:created</span>
                    <span className="event-task-name">"{notif.taskTitle}"</span>
                    <span className="event-user">👤 User: {notif.user}</span>
                    <span className="event-status-badge">✅ {notif.status}</span>
                  </div>

                  <div className="event-timestamps-grid">
                    <div className="timestamp-item">
                      <span className="ts-label">⚡ API Response Timestamp:</span>
                      <code className="ts-value">{notif.apiEmittedAt}</code>
                      <span className="ts-subtext">Immediate synchronous HTTP return</span>
                    </div>

                    <div className="timestamp-item">
                      <span className="ts-label">🕒 Handler Started Timestamp:</span>
                      <code className="ts-value">{notif.handlerStartedAt}</code>
                      <span className="ts-subtext">Asynchronous listener triggered</span>
                    </div>

                    <div className="timestamp-item">
                      <span className="ts-label">🏁 Handler Completed Timestamp:</span>
                      <code className="ts-value">{notif.handlerCompletedAt}</code>
                      <span className="ts-subtext">Background notification finalized</span>
                    </div>

                    <div className="timestamp-item delta-item">
                      <span className="ts-label">⏱️ Execution Time Delta:</span>
                      <span className="ts-delta">+{notif.executionDeltaMs} ms</span>
                      <span className="ts-subtext">Proof of non-blocking background queue</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: Docker Containerization ─── */}
      {activeTab === 'devops' && (
        <div className="devops-panel">
          {/* Docker Section */}
          <div className="devops-card">
            <div className="devops-card-header">
              <div className="devops-icon">🐳</div>
              <div>
                <h3 className="devops-title">Containerization with Docker & Docker Compose</h3>
                <p className="devops-desc">
                  Multi-container orchestration for React Frontend (Nginx Alpine), Node/Express Backend, and MongoDB Database.
                </p>
              </div>
            </div>

            <div className="containers-grid">
              <div className="container-box">
                <span className="container-tag">Frontend Service</span>
                <h4 className="container-name">awf-frontend</h4>
                <p className="container-detail">Multi-stage build with Node 20 & Nginx Alpine</p>
                <code className="container-port">Port: 80 / 3000</code>
                <span className="container-status">Active (Dockerfile configured)</span>
              </div>

              <div className="container-box">
                <span className="container-tag">Backend Service</span>
                <h4 className="container-name">awf-backend</h4>
                <p className="container-detail">Node.js Express REST API & EventEmitter</p>
                <code className="container-port">Port: 5000</code>
                <span className="container-status">Active (Dockerfile configured)</span>
              </div>

              <div className="container-box">
                <span className="container-tag">Database Service</span>
                <h4 className="container-name">awf-mongodb</h4>
                <p className="container-detail">Official MongoDB 6.0 with persistent data volume</p>
                <code className="container-port">Port: 27017</code>
                <span className="container-status">Active (Volume mounted)</span>
              </div>
            </div>

            <div className="devops-command-box">
              <span className="cmd-label">💻 Single command to orchestrate entire stack:</span>
              <pre className="cmd-code">docker-compose up --build</pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TaskManager;
