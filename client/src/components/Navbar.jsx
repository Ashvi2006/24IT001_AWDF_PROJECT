import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import './Navbar.css';

function Navbar({ user, onLogout, onLoginSuccess }) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('light-mode', isDarkMode);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Left: Brand Logo */}
        <Link to="/" className="header-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">Ashvi's <span className="brand-highlight">Portfolio</span></span>
        </Link>

        {/* Center: Navigation Pills */}
        <nav className="header-nav">
          <div className="nav-pill-container">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">🏠</span> Home
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📁</span> Projects
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">💬</span> Contact
            </NavLink>
          </div>
        </nav>

        {/* Right: Actions (Theme Toggle + Auth) */}
        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {isDarkMode ? '☀️ Dark' : '🌙 Light'}
          </button>

          {user ? (
            <div className="logged-in-wrap">
              <span className="user-badge" style={{ color: '#86efac', fontWeight: 600 }}>
                👤 {user.username}
              </span>
              <button
                type="button"
                className="auth-btn btn-logout-nav"
                onClick={handleLogoutClick}
                title="Logout from account"
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="auth-btn" style={{ textDecoration: 'none' }}>
              <span className="auth-icon">🔑</span> Login
            </Link>
          )}
        </div>
      </div>

      {/* Optional Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={onLoginSuccess}
        user={user}
        onLogout={handleLogoutClick}
      />
    </header>
  );
}

export default Navbar;
