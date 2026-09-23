import { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskManager.css';

const API_URL = 'http://localhost:5000/api/tasks';

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

  const priorityEmojis = { Low: '🟢', Medium: '🟡', High: '🔴' };

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Backend Connection Error: ${err.message}. (Ensure Express server is running on http://localhost:5000)`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    try {
      const res = await axios.post(API_URL, { title: title.trim(), description: description.trim(), priority });
      setTasks([res.data, ...tasks]);
      setTitle('');
      setDescription('');
      setPriority('Medium');
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
          <h2 className="section-title">⚡ Full-Stack Task Manager (REST + MongoDB Atlas)</h2>
          <p className="task-subtitle">Practicals 4-7: Isolated Task Actions, Inline Editing, CRUD & Validation</p>
        </div>
        <button className="btn btn-refresh" onClick={fetchTasks} disabled={loading}>
          🔄 Refresh Tasks
        </button>
      </div>

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
    </section>
  );
}

export default TaskManager;
