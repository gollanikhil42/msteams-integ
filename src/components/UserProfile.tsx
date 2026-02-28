import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { IUser } from '../types';
import '../styles/components.css';

export const UserProfile: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  if (!user) return null;

  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="user-profile">
      <h3 className="profile-title">👤 Profile</h3>

      <div className="profile-content">
        <div className="profile-avatar-large">{getInitials(user.displayName)}</div>

        <div className="profile-details">
          <div className="profile-field">
            <span className="field-label">Name</span>
            <span className="field-value">{user.displayName}</span>
          </div>

          <div className="profile-field">
            <span className="field-label">Email</span>
            <span className="field-value">{user.mail}</span>
          </div>

          {user.jobTitle && (
            <div className="profile-field">
              <span className="field-label">Job Title</span>
              <span className="field-value">{user.jobTitle}</span>
            </div>
          )}

          {user.officeLocation && (
            <div className="profile-field">
              <span className="field-label">Office Location</span>
              <span className="field-value">{user.officeLocation}</span>
            </div>
          )}
        </div>
      </div>

      <div className="profile-badge">
        <span className="status-dot-lg"></span>
        <span className="badge-text">Status: Online</span>
      </div>
    </div>
  );
};
