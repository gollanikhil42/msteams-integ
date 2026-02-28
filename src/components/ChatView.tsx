import React, { useState, useEffect } from 'react';
import { graphService } from '../services/graphService';
import { IChatMessage } from '../types';
import '../styles/components.css';

interface ChatViewProps {
  teamId: string;
  teamName: string;
  channelId: string;
  channelName: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  teamId,
  teamName,
  channelId,
  channelName
}) => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const msgs = await graphService.getChannelMessages(teamId, channelId);
        setMessages(msgs);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [teamId, channelId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message = await graphService.sendChannelMessage(
        teamId,
        channelId,
        newMessage
      );
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="chat-view">
      <div className="chat-header">
        <div>
          <h2 className="channel-name">💬 {channelName}</h2>
          <p className="channel-info">in {teamName}</p>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <p className="loading">Loading messages...</p>
        ) : messages.length > 0 ? (
          messages.map(msg => (
            <div key={msg.id} className="message-item">
              <div className="message-from">{msg.from}</div>
              <div className="message-time">
                {new Date(msg.createdDateTime).toLocaleTimeString()}
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        ) : (
          <p className="no-messages">No messages in this channel yet</p>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};
