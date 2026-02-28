import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { graphService } from '../services/graphService';
import { IUser } from '../types';
import '../styles/components.css';

export const Header: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [presence, setPresence] = useState<string>('Connected');

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = authService.getCurrentUser();

      try {
        const graphProfile = await graphService.getUserProfile();
        setUser(graphProfile);
      } catch {
        setUser(currentUser);
      }
      
      const presenceData = await graphService.getUserPresence();
      setPresence(presenceData.availability);
    };

    loadUserData();
  }, []);

  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">Collaboration Hub</div>
          <nav className="nav-menu">
            <a href="#" className="nav-link active">Dashboard</a>
            <a href="#" className="nav-link">Tasks</a>
            <a href="#" className="nav-link">Teams</a>
            <a href="#" className="nav-link">Integrations</a>
          </nav>
        </div>

        {user && (
          <div className="header-right">
            <div className="user-quick-info">
              <span className="user-name">{user.displayName}</span>
              <span className={`status-badge ${presence === 'Available' || presence === 'Connected' ? 'available' : 'away'}`}>
                {presence}
              </span>
            </div>
            <div className="user-avatar">{getInitials(user.displayName)}</div>
            <button className="logout-btn" onClick={onLogout}>
              ⎕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
