import { IUser, ITeam, IChannel, IChatMessage } from '../types';
import { authService } from './authService';
import { GRAPH_API_URL } from '../config/msalConfig';

/**
 * Microsoft Graph API Service
 * Handles real communication with Microsoft Graph REST API
 */
class GraphService {
  private formatDisplayEmail(response: any): string {
    if (response.mail) {
      return response.mail;
    }

    if (Array.isArray(response.otherMails) && response.otherMails.length > 0) {
      return response.otherMails[0];
    }

    const upn = response.userPrincipalName || response.userPrincipalname || '';
    if (upn.includes('#EXT#')) {
      const guestPart = upn.split('#EXT#')[0];
      const lastUnderscoreIndex = guestPart.lastIndexOf('_');
      if (lastUnderscoreIndex > 0) {
        return `${guestPart.slice(0, lastUnderscoreIndex)}@${guestPart.slice(lastUnderscoreIndex + 1)}`;
      }
      return guestPart;
    }

    return upn;
  }

  /**
   * Make authenticated API call to Microsoft Graph
   */
  private async callGraph(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    try {
      const token = await authService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const options: RequestInit = {
        method,
        headers,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${GRAPH_API_URL}${endpoint}`, options);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Graph API error: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Graph API call failed:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<IUser> {
    try {
      const response = await this.callGraph('/me?$select=id,displayName,mail,userPrincipalName,otherMails,jobTitle,officeLocation,mobilePhone');
      return {
        id: response.id,
        displayName: response.displayName,
        mail: this.formatDisplayEmail(response),
        jobTitle: response.jobTitle,
        officeLocation: response.officeLocation,
        mobilePhone: response.mobilePhone,
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      // Fallback to current user from auth service
      const user = authService.getCurrentUser();
      if (user) return user;
      throw error;
    }
  }

  /**
   * Get user's teams
   */
  async getUserTeams(): Promise<ITeam[]> {
    const response = await this.callGraph('/me/joinedTeams');
    if (!response.value) {
      return [];
    }

    return response.value.map((team: any) => ({
      id: team.id,
      displayName: team.displayName,
      description: team.description,
      visibility: team.visibility,
    }));
  }

  /**
   * Get channels for a specific team
   */
  async getTeamChannels(teamId: string): Promise<IChannel[]> {
    try {
      const response = await this.callGraph(`/teams/${teamId}/channels`);
      if (!response.value) {
        return [];
      }

      return response.value.map((channel: any) => ({
        id: channel.id,
        displayName: channel.displayName,
        description: channel.description,
        createdDateTime: channel.createdDateTime,
      }));
    } catch (error) {
      console.error(`Failed to get channels for team ${teamId}:`, error);
      return [];
    }
  }

  /**
   * Get messages from a channel
   */
  async getChannelMessages(teamId: string, channelId: string): Promise<IChatMessage[]> {
    try {
      const response = await this.callGraph(
        `/teams/${teamId}/channels/${channelId}/messages?$top=50`
      );
      if (!response.value) {
        return [];
      }

      return response.value.map((message: any) => ({
        id: message.id,
        from: message.from?.user?.displayName || 'Unknown',
        content: message.body?.content || '',
        createdDateTime: message.createdDateTime,
      }));
    } catch (error) {
      console.error(`Failed to get messages from channel:`, error);
      return [];
    }
  }

  /**
   * Send a message to a channel
   */
  async sendChannelMessage(
    teamId: string,
    channelId: string,
    content: string
  ): Promise<IChatMessage> {
    try {
      const messageBody = {
        body: {
          content: content,
        },
      };

      const response = await this.callGraph(
        `/teams/${teamId}/channels/${channelId}/messages`,
        'POST',
        messageBody
      );

      return {
        id: response.id,
        from: response.from?.user?.displayName || authService.getCurrentUser()?.displayName || 'Unknown',
        content: response.body?.content || content,
        createdDateTime: response.createdDateTime,
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Create an online meeting
   */
  async createOnlineMeeting(subject: string, duration: number = 60): Promise<{ joinWebUrl: string; id: string }> {
    try {
      const meetingBody = {
        subject: subject,
        startDateTime: new Date().toISOString(),
        endDateTime: new Date(Date.now() + duration * 60000).toISOString(),
        participants: {
          attendees: [],
        },
      };

      const response = await this.callGraph('/me/onlineMeetings', 'POST', meetingBody);

      return {
        id: response.id,
        joinWebUrl: response.joinWebUrl,
      };
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw error;
    }
  }

  /**
   * Get user's presence status
   */
  async getUserPresence(): Promise<{ activity: string; availability: string }> {
    try {
      const response = await this.callGraph('/me/presence');
      return {
        activity: response.activity || 'Connected',
        availability: response.availability || 'Connected',
      };
    } catch (error) {
      console.error('Failed to get user presence:', error);
      return {
        activity: 'Connected',
        availability: 'Connected',
      };
    }
  }

  /**
   * Search for users
   */
  async searchUsers(query: string): Promise<IUser[]> {
    try {
      const response = await this.callGraph(
        `/users?$filter=startswith(displayName,'${query}') or startswith(mail,'${query}')&$top=10`
      );
      if (!response.value) {
        return [];
      }

      return response.value.map((user: any) => ({
        id: user.id,
        displayName: user.displayName,
        mail: user.mail,
        jobTitle: user.jobTitle,
        officeLocation: user.officeLocation,
      }));
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }
}

export const graphService = new GraphService();
