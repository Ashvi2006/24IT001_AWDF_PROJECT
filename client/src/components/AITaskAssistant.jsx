import { useState, useEffect } from 'react';
import axios from 'axios';
import './AITaskAssistant.css';

const AI_API_URL = 'http://localhost:5000/api/ai';

function AITaskAssistant({ onApplyToForm, onAddTaskDirectly }) {
  const [taskIdea, setTaskIdea] = useState('');
  const [category, setCategory] = useState('Full-Stack');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  // Suggested preset chips for quick testing
  const inspirationChips = [
    { label: '🐳 Containerize Microservices', text: 'Write Dockerfile and Docker Compose orchestration for Node and React' },
    { label: '⚡ Node Native EventEmitter', text: 'Implement asynchronous background notification system with EventEmitter' },
    { label: '🚀 GitHub Actions CI Pipeline', text: 'Configure automated testing and build pipeline with GitHub Actions' },
    { label: '🔒 Auth Security Audit', text: 'Add rate limiting and JWT validation for protected API routes' },
    { label: '🧹 Database Index Optimization', text: 'Optimize MongoDB query latency with compound indexes' }
  ];

  // Fetch AI status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${AI_API_URL}/status`);
        setAiStatus(res.data);
      } catch (err) {
        // Fallback info if server offline
        setAiStatus({ currentMode: 'Responsible Smart Fallback Engine' });
      }
    };
    fetchStatus();
  }, []);

  const handleGenerate = async (ideaOverride) => {
    const query = ideaOverride || taskIdea;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${AI_API_URL}/suggest`, {
        title: query.trim(),
        category
      });

      if (res.data?.success && res.data.data) {
        setAiResult({
          ...res.data.data,
          source: res.data.source,
          fallbackActive: res.data.fallbackActive
        });
      } else {
        throw new Error('Unexpected response format from AI service');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `AI Service notification: ${err.message}. Using built-in local generation.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToForm = () => {
    if (!aiResult) return;
    if (onApplyToForm) {
      onApplyToForm({
        title: aiResult.title,
        description: `${aiResult.description} (Est: ${aiResult.estimatedHours}h, Deadline: ${aiResult.suggestedDeadline})`,
        priority: aiResult.priority
      });
    }
  };

  const handleAddDirect = () => {
    if (!aiResult) return;
    if (onAddTaskDirectly) {
      onAddTaskDirectly({
        title: aiResult.title,
        description: `${aiResult.description} | Checklist: ${aiResult.subtasks?.join(', ') || ''}`,
        priority: aiResult.priority
      });
    }
  };

  return (
    <div className="ai-assistant-card">
      <div className="ai-assistant-header">
        <div className="ai-title-wrap">
          <div className="ai-badge-icon">✨</div>
          <div>
            <h3 className="ai-assistant-title">Week 13: AI-Powered Task Copilot</h3>
            <p className="ai-assistant-subtitle">
              Intelligent task generation, smart prioritization & deadline suggestion with Responsible AI Fallback
            </p>
          </div>
        </div>

        <div className="ai-status-pill">
          <span className="ai-pulse-dot"></span>
          <span className="ai-status-text">
            {aiStatus?.currentMode || 'Gemini AI / Responsible Fallback'}
          </span>
        </div>
      </div>

      {/* Input row */}
      <div className="ai-input-box">
        <div className="ai-input-row">
          <input
            type="text"
            className="ai-text-input"
            placeholder="Type a task idea (e.g., 'Setup Redis caching' or 'Implement OAuth2')..."
            value={taskIdea}
            onChange={(e) => setTaskIdea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <select
            className="ai-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Full-Stack">Full-Stack</option>
            <option value="DevOps">DevOps / Cloud</option>
            <option value="Security">Security & Auth</option>
            <option value="Testing">Testing & QA</option>
          </select>
          <button
            className="btn btn-ai-generate"
            onClick={() => handleGenerate()}
            disabled={loading || !taskIdea.trim()}
          >
            {loading ? '🔮 Generating...' : '✨ Generate with AI'}
          </button>
        </div>

        {/* Preset chips */}
        <div className="ai-chips-wrapper">
          <span className="chips-label">💡 Instant Prompts:</span>
          <div className="chips-list">
            {inspirationChips.map((chip, i) => (
              <button
                key={i}
                type="button"
                className="ai-chip"
                onClick={() => {
                  setTaskIdea(chip.text);
                  handleGenerate(chip.text);
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="ai-alert ai-alert-warning">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Generated AI result */}
      {aiResult && (
        <div className="ai-result-panel animate-fade-in">
          <div className="ai-result-meta-bar">
            <div className="ai-meta-left">
              <span className={`ai-priority-tag priority-${aiResult.priority.toLowerCase()}`}>
                {aiResult.priority === 'High' ? '🔴' : aiResult.priority === 'Medium' ? '🟡' : '🟢'} Priority: {aiResult.priority}
              </span>
              <span className="ai-category-tag">📁 {aiResult.category || category}</span>
              <span className="ai-deadline-tag">📅 Deadline: {aiResult.suggestedDeadline}</span>
              <span className="ai-hours-tag">⏱️ Est: {aiResult.estimatedHours} hrs</span>
            </div>
            <span className="ai-provider-badge">
              {aiResult.fallbackActive ? '🛡️ Responsible NLP Fallback' : `🤖 ${aiResult.source}`}
            </span>
          </div>

          <div className="ai-content-body">
            <h4 className="ai-generated-title">{aiResult.title}</h4>
            <p className="ai-generated-desc">{aiResult.description}</p>
            {aiResult.priorityReason && (
              <p className="ai-reason-text">
                <strong>💡 Priority Reasoning:</strong> {aiResult.priorityReason}
              </p>
            )}

            {aiResult.subtasks && aiResult.subtasks.length > 0 && (
              <div className="ai-subtasks-section">
                <span className="subtasks-header">📋 Recommended Action Steps:</span>
                <ul className="ai-subtasks-list">
                  {aiResult.subtasks.map((st, idx) => (
                    <li key={idx} className="subtask-item">
                      <span className="subtask-checkbox">✔</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="ai-actions-row">
            <button
              type="button"
              className="btn btn-apply-form"
              onClick={handleApplyToForm}
            >
              📝 Fill into Task Form
            </button>
            <button
              type="button"
              className="btn btn-create-direct"
              onClick={handleAddDirect}
            >
              ➕ Create Task Directly
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AITaskAssistant;
