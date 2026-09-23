import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import AuthModal from './AuthModal';
import './Navbar.css';

function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('light-mode', isDarkMode);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthOpen(false);
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
            <button className="auth-btn logged-in" onClick={() => setIsAuthOpen(true)}>
              <span className="user-badge">👤 {user.username}</span>
            </button>
          ) : (
            <button className="auth-btn" onClick={() => setIsAuthOpen(true)}>
              <span className="auth-icon">✏️</span> Login / Register
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}

export default Navbar;
