import React, { useState, useEffect } from 'react';
import { graphService } from '../services/graphService';
import { ITeam, IChannel } from '../types';
import '../styles/components.css';

interface TeamsListProps {
  onSelectChannel: (teamId: string, teamName: string, channelId: string, channelName: string) => void;
}

export const TeamsList: React.FC<TeamsListProps> = ({ onSelectChannel }) => {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [channels, setChannels] = useState<Map<string, IChannel[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await graphService.getUserTeams();
        setTeams(teamsData);
        
        if (teamsData.length > 0) {
          loadChannelsForTeam(teamsData[0].id);
          setExpandedTeam(teamsData[0].id);
        }
      } catch (error) {
        console.error('Failed to load teams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const loadChannelsForTeam = async (teamId: string) => {
    try {
      const channelsData = await graphService.getTeamChannels(teamId);
      setChannels(prev => new Map(prev).set(teamId, channelsData));
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const handleTeamClick = async (teamId: string) => {
    if (expandedTeam === teamId) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(teamId);
      if (!channels.has(teamId)) {
        await loadChannelsForTeam(teamId);
      }
    }
  };

  return (
    <div className="teams-list">
      <h3 className="teams-title">👥 Your Teams</h3>

      {loading ? (
        <p className="loading">Loading teams...</p>
      ) : teams.length > 0 ? (
        <div className="teams-container">
          {teams.map(team => (
            <div key={team.id} className="team-item">
              <button
                className="team-btn"
                onClick={() => handleTeamClick(team.id)}
              >
                <span className="chevron">
                  {expandedTeam === team.id ? '▼' : '▶'}
                </span>
                <span className="team-name">{team.displayName}</span>
              </button>

              {expandedTeam === team.id && channels.get(team.id) && (
                <div className="channels-list">
                  {channels.get(team.id)?.map(channel => (
                    <button
                      key={channel.id}
                      className="channel-btn"
                      onClick={() =>
                        onSelectChannel(team.id, team.displayName, channel.id, channel.displayName)
                      }
                    >
                      <span className="channel-icon">#</span>
                      {channel.displayName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-items">No teams found</p>
      )}
    </div>
  );
};
