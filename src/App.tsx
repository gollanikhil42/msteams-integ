import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { Header } from './components/Header';
import { UserProfile } from './components/UserProfile';
import { Dashboard } from './components/Dashboard';
import './styles/app.css';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await authService.initialize();
        const loggedIn = await authService.trySilentLogin();
        setIsAuthenticated(loggedIn);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = async () => {
    if (authService.isLoginInProgress()) {
      return;
    }

    try {
      setAuthenticating(true);
      const loggedIn = await authService.login();
      setIsAuthenticated(loggedIn);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#F3F2F1'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: 16, color: '#605E5C' }}>Loading application...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <h1 style={{ marginBottom: 12, color: '#0F1419' }}>Collaboration Hub</h1>
          <p style={{ marginBottom: 24, color: '#605E5C' }}>Powered by Microsoft Teams Integration</p>
          <button
            onClick={handleLogin}
            disabled={authenticating}
            style={{
              padding: '12px 32px',
              fontSize: 16,
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: authenticating ? 'not-allowed' : 'pointer',
              opacity: authenticating ? 0.7 : 1,
              fontWeight: 600,
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5568d3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
          >
            {authenticating ? 'Signing in...' : 'Sign In with Microsoft'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} />
      <div className="app-layout">
        <Dashboard />
      </div>
    </div>
  );
};
