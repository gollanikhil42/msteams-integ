import React, { useState, useEffect, useRef } from 'react';
import { graphService } from '../services/graphService';
import { ITeam, IChannel, IUser } from '../types';
import '../styles/teams-panel.css';

export const TeamsIntegrationPanel: React.FC = () => {
  const hasLoadedRef = useRef(false);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [profile, setProfile] = useState<IUser | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [channels, setChannels] = useState<IChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<IChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('Team Meeting');
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;

    const loadTeams = async () => {
      try {
        setLoading(true);
        const profileData = await graphService.getUserProfile();
        setProfile(profileData);

        const teamsData = await graphService.getUserTeams();
        setTeams(teamsData);
        if (teamsData.length > 0) {
          setSelectedTeam(teamsData[0]);
          loadChannels(teamsData[0].id);
        }
      } catch (error) {
        console.error('Failed to load teams:', error);
        const text = String(error || '');
        if (text.includes('Failed to get license information for the user')) {
          setErrorMessage('Your account is signed in, but Microsoft Teams data is blocked: this user does not have a valid Microsoft 365/Teams license in this tenant. Use a licensed work/school account or assign a Teams-enabled license.');
        } else if (text.includes('403')) {
          setErrorMessage('Access denied by Microsoft Graph (403). Verify API permissions and admin consent in Azure App Registration.');
        } else {
          setErrorMessage('Failed to load teams. Please ensure you are logged in.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const loadChannels = async (teamId: string) => {
    try {
      const channelsData = await graphService.getTeamChannels(teamId);
      setChannels(channelsData);
      if (channelsData.length > 0) {
        setSelectedChannel(channelsData[0]);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const handleTeamSelect = async (team: ITeam) => {
    setSelectedTeam(team);
    await loadChannels(team.id);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedTeam || !selectedChannel) {
      setErrorMessage('Please enter a message and select a channel');
      return;
    }

    try {
      setIsSending(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      await graphService.sendChannelMessage(
        selectedTeam.id,
        selectedChannel.id,
        messageContent
      );
      
      setSuccessMessage('Message sent successfully! ✓');
      setMessageContent('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) {
      setErrorMessage('Please enter a meeting title');
      return;
    }

    try {
      setIsCreatingMeeting(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const meeting = await graphService.createOnlineMeeting(meetingTitle, 60);
      setSuccessMessage(`Meeting created! Join link: ${meeting.joinWebUrl}`);
      
      // Optionally, send the meeting link to the channel
      if (selectedTeam && selectedChannel) {
        const messageWithLink = `📞 New Meeting: ${meetingTitle}\n\nJoin here: ${meeting.joinWebUrl}`;
        await graphService.sendChannelMessage(
          selectedTeam.id,
          selectedChannel.id,
          messageWithLink
        );
        setSuccessMessage(`Meeting created and shared in ${selectedChannel.displayName}!`);
      }
      
      setMeetingTitle('Team Meeting');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Failed to create meeting:', error);
      setErrorMessage('Failed to create meeting. Please check permissions.');
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  if (loading) {
    return <div className="teams-panel-loading">Loading Teams data...</div>;
  }

  return (
    <div className="teams-panel">
      {profile && (
        <div className="profile-summary">
          <h3>Connected Microsoft Account</h3>
          <div className="profile-summary-grid">
            <div>
              <p className="profile-summary-label">Name</p>
              <p className="profile-summary-value">{profile.displayName}</p>
            </div>
            <div>
              <p className="profile-summary-label">Email</p>
              <p className="profile-summary-value">{profile.mail || 'Not available'}</p>
            </div>
            <div>
              <p className="profile-summary-label">Job Title</p>
              <p className="profile-summary-value">{profile.jobTitle || 'Not available'}</p>
            </div>
            <div>
              <p className="profile-summary-label">Office</p>
              <p className="profile-summary-value">{profile.officeLocation || 'Not available'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alert Messages */}
      {successMessage && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#d4edda', 
          color: '#155724',
          borderRadius: '4px',
          marginBottom: '12px',
          border: '1px solid #c3e6cb'
        }}>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '12px',
          border: '1px solid #f5c6cb'
        }}>
          {errorMessage}
        </div>
      )}

      {!loading && teams.length === 0 && (
        <div className="teams-empty-state">
          <h3>Teams workspace data is unavailable for this account</h3>
          <p>
            Microsoft sign-in and Graph profile retrieval are working. Team/channel endpoints require a licensed
            work or school Microsoft 365 account.
          </p>
        </div>
      )}

      <div className="teams-layout">
        {/* Teams Sidebar */}
        <div className="teams-sidebar">
          <h3>Teams</h3>
          <div className="teams-list">
            {teams.map(team => (
              <div
                key={team.id}
                className={`team-row ${selectedTeam?.id === team.id ? 'active' : ''}`}
                onClick={() => handleTeamSelect(team)}
              >
                <div className="team-icon">{team.displayName[0]}</div>
                <div className="team-info">
                  <p className="team-title">{team.displayName}</p>
                  <p className="team-members">{team.memberCount || 0} members</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="teams-main">
          {selectedTeam && (
            <>
              {/* Team Header */}
              <div className="team-header">
                <div className="team-header-info">
                  <h2>{selectedTeam.displayName}</h2>
                  <p className="team-desc">{selectedTeam.description}</p>
                  <div className="team-meta">
                    <span className="badge">{selectedTeam.visibility}</span>
                    <span className="member-count">👥 {selectedTeam.memberCount} members</span>
                  </div>
                </div>
              </div>

              <div className="team-content">
                {/* Channels */}
                <div className="channels-section">
                  <h3>Channels</h3>
                  <div className="channels-grid">
                    {channels.map(channel => (
                      <div
                        key={channel.id}
                        className={`channel-card ${selectedChannel?.id === channel.id ? 'active' : ''}`}
                        onClick={() => setSelectedChannel(channel)}
                      >
                        <div className="channel-header">
                          <span className="channel-icon">#</span>
                          <span className="channel-name">{channel.displayName}</span>
                        </div>
                        <p className="channel-desc">{channel.description || 'No description'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Channel Details */}
                {selectedChannel && (
                  <div className="channel-detail">
                    <h3>Channel: {selectedChannel.displayName}</h3>
                    
                    {/* Message Input */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                        Send Message
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          placeholder="Type your message..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSendMessage();
                          }}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={isSending}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isSending ? 'not-allowed' : 'pointer',
                            opacity: isSending ? 0.6 : 1
                          }}
                        >
                          {isSending ? 'Sending...' : '📝 Send'}
                        </button>
                      </div>
                    </div>

                    {/* Meeting Creation */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                        Create Microsoft Teams Meeting
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                          placeholder="Meeting title..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                        <button
                          onClick={handleCreateMeeting}
                          disabled={isCreatingMeeting}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isCreatingMeeting ? 'not-allowed' : 'pointer',
                            opacity: isCreatingMeeting ? 0.6 : 1
                          }}
                        >
                          {isCreatingMeeting ? 'Creating...' : '📞 Create Meeting'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
