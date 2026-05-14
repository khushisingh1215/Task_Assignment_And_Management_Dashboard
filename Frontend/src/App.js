import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PendingTasks from './components/PendingTasks';
import CompletedTasks from './components/CompletedTasks';
import RecentActivity from './components/RecentActivity';
import ProgressBar from './components/ProgressBar';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import UserManagement from './components/UserManagement';
import EditUserPage from './components/EditUserPage';
import { isAuthenticated, removeToken, getToken } from './services/authService';
import { jwtDecode } from 'jwt-decode';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState(null);

  // keep local state in sync with token / navigation
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, [location]);

  const handleLogout = () => {
    removeToken();
    setAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  // this callback is passed down to <Login> so that the
  // parent component's authenticated state is updated immediately
  const handleLoginSuccess = () => {
    setAuthenticated(true);
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
    navigate('/');
  };

  // always render the login screen when the user is on that route
  if (location.pathname === '/login') {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // if we're not authenticated, show login instead of dashboard
  if (!authenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="app-wrapper">
      <ProgressBar />
      <div className="container">
        <header>
          <h1>✨ Task Manager</h1>
          <nav>
            <NavLink to="/" end>📊 Dashboard</NavLink>
            <NavLink to="/pending">⏳ Pending Tasks</NavLink>
            <NavLink to="/completed">✅ Completed Tasks</NavLink>
            <NavLink to="/recent">🕐 Recent Activity</NavLink>
            {userRole === 'admin' && (
              <NavLink to="/users">👥 User Management</NavLink>
            )}
            <button className="logout-button" onClick={handleLogout}>🚪 Logout</button>
          </nav>
        </header>

        <main key={location.pathname}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/pending" element={<ProtectedRoute><PendingTasks /></ProtectedRoute>} />
            <Route path="/completed" element={<ProtectedRoute><CompletedTasks /></ProtectedRoute>} />
            <Route path="/recent" element={<ProtectedRoute><RecentActivity /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/users/edit/:id" element={<ProtectedRoute><EditUserPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

