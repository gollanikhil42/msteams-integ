import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TeamsIntegrationPanel } from './TeamsIntegrationPanel';

const { mockGraphService } = vi.hoisted(() => ({
  mockGraphService: {
    getUserProfile: vi.fn(),
    getUserTeams: vi.fn(),
    getTeamChannels: vi.fn(),
    sendChannelMessage: vi.fn(),
    createOnlineMeeting: vi.fn(),
  },
}));

vi.mock('../services/graphService', () => ({
  graphService: mockGraphService,
}));

describe('TeamsIntegrationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGraphService.getUserProfile.mockResolvedValue({
      id: '1',
      displayName: 'Test User',
      mail: 'test@contoso.com',
      jobTitle: 'Engineer',
      officeLocation: 'Hyderabad',
    });
  });

  it('shows empty-state guidance when no teams are returned', async () => {
    mockGraphService.getUserTeams.mockResolvedValue([]);

    render(<TeamsIntegrationPanel />);

    expect(await screen.findByText(/teams workspace data is unavailable/i)).toBeInTheDocument();
  });

  it('sends a message for selected team/channel', async () => {
    mockGraphService.getUserTeams.mockResolvedValue([
      {
        id: 'team-1',
        displayName: 'Engineering',
        description: 'Core team',
        visibility: 'private',
        memberCount: 5,
      },
    ]);

    mockGraphService.getTeamChannels.mockResolvedValue([
      {
        id: 'channel-1',
        displayName: 'General',
        description: 'General channel',
      },
    ]);

    mockGraphService.sendChannelMessage.mockResolvedValue({});

    render(<TeamsIntegrationPanel />);

    expect(await screen.findByRole('heading', { name: 'Engineering' })).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/type your message/i), 'Hello from tests');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(mockGraphService.sendChannelMessage).toHaveBeenCalledWith('team-1', 'channel-1', 'Hello from tests');
    });

    expect(await screen.findByText(/message sent successfully/i)).toBeInTheDocument();
  });

  it('shows licensing guidance when graph returns license error', async () => {
    mockGraphService.getUserTeams.mockRejectedValue(new Error('Failed to get license information for the user'));

    render(<TeamsIntegrationPanel />);

    expect(await screen.findByText(/does not have a valid microsoft 365\/teams license/i)).toBeInTheDocument();
  });
});
