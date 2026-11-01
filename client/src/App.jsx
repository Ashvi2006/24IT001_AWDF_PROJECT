import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PageLoader from './components/PageLoader';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      return (stored && token) ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        {user && <Navbar user={user} onLogout={handleLogout} onLoginSuccess={handleLoginSuccess} />}
        <main className={`main-content ${!user ? 'login-layout' : ''}`}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Login Page Route */}
              <Route
                path="/login"
                element={
                  user ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Login onLoginSuccess={handleLoginSuccess} />
                  )
                }
              />

              {/* Protected Home Route - opens only after login */}
              <Route
                path="/"
                element={
                  user ? (
                    <Home />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Protected Projects Route */}
              <Route
                path="/projects"
                element={
                  user ? (
                    <Projects />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Protected Contact Route */}
              <Route
                path="/contact"
                element={
                  user ? (
                    <Contact />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
