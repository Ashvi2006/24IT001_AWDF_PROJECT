import { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, onLoginSuccess, user, onLogout }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const url = isLogin 
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/auth/register';

    try {
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const res = await axios.post(url, payload);
      setSuccessMsg(res.data.message);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user, res.data.token);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication request failed');
    } finally {
      setLoading(false);
    }
  };

  const modalMarkup = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        {user ? (
          <div className="user-profile-view">
            <div className="avatar">👤</div>
            <h3>Logged In as <strong>{user.username}</strong></h3>
            <p className="user-email">📧 {user.email}</p>
            <div className="jwt-badge">🔒 JWT Token Verified</div>
            <button className="btn btn-logout" onClick={onLogout}>
              🚪 Logout
            </button>
          </div>
        ) : (
          <>
            <h3 className="modal-title">
              {isLogin ? '🔑 Login' : '📝 Register'}
            </h3>

            {error && <div className="auth-error">⚠️ {error}</div>}
            {successMsg && <div className="auth-success">✅ {successMsg}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Ashvi Antala"
                    value={formData.username}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              )}

              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="24IT001"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <button type="submit" className="btn btn-auth-submit" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
              </button>
            </form>

            <div className="auth-toggle-prompt">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                className="btn-link" 
                onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); }}
              >
                {isLogin ? 'Register here' : 'Login here'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
}

export default AuthModal;
