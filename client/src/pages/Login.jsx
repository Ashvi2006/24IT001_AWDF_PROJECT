import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedUsername = formData.username.trim() || 'Ashvi Antala';
    const userObj = {
      id: 'user_' + Date.now(),
      username: trimmedUsername,
      email: trimmedUsername.toLowerCase().replace(/\s+/g, '') + '@example.com'
    };
    const token = 'jwt_token_' + Date.now();

    setTimeout(() => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      if (onLoginSuccess) {
        onLoginSuccess(userObj);
      }
      setLoading(false);
      navigate('/');
    }, 300);
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <span className="login-brand-icon">⚡</span>
          <h1 className="login-brand-title">Ashvi's <span>Portfolio</span></h1>
          <p className="login-brand-subtitle">
            Enter Username and Password to access your Portfolio & Dashboard
          </p>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="login-alert login-alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label htmlFor="auth-username">Username</label>
            <input
              id="auth-username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-submit-auth" disabled={loading}>
            {loading ? '⏳ Logging in...' : '🔓 Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
