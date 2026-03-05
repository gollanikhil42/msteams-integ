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
  console.log('\n📋 TEST: Empty teams state')
  console.log('   → Situation: Personal Microsoft account — no Teams workspace')
  console.log('   → Mocking: getUserTeams() returns [] (empty array)')

  mockGraphService.getUserTeams.mockResolvedValue([]);
  /*mockGraphService.getUserTeams.mockRejectedValue(
    new Error('Something broke')
);*/
  console.log('   → Action: Rendering TeamsIntegrationPanel...')
  render(<TeamsIntegrationPanel />);

  console.log('   → Waiting for empty-state message to appear...')
  expect(
    await screen.findByText(/teams workspace data is unavailable/i)
  ).toBeInTheDocument();

  console.log('   ✅ RESULT: Empty-state guidance shown — handled gracefully, no crash')
});

  it('sends a message for selected team/channel', async () => {
  console.log('\n📋 TEST: Send Teams message')
  console.log('   → Situation: Licensed user selects a team/channel and sends a message')
  console.log('   → Mocking: 1 team (Engineering), 1 channel (General)')

  mockGraphService.getUserTeams.mockResolvedValue([
    { id: 'team-1', displayName: 'Engineering', description: 'Core team',
      visibility: 'private', memberCount: 5 }
  ]);
  mockGraphService.getTeamChannels.mockResolvedValue([
    { id: 'channel-1', displayName: 'General', description: 'General channel' }
  ]);
  mockGraphService.sendChannelMessage.mockResolvedValue({});

  console.log('   → Action: Rendering panel...')
  render(<TeamsIntegrationPanel />);

  console.log('   → Waiting for Engineering team to load and display...')
  expect(
    await screen.findByRole('heading', { name: 'Engineering' })
  ).toBeInTheDocument();

  console.log('   → Typing message: "Hello from tests"')
  await userEvent.type(
    screen.getByPlaceholderText(/type your message/i),
    'Hello from tests'
  );

  console.log('   → Clicking Send button...')
  await userEvent.click(screen.getByRole('button', { name: /send/i }));

  console.log('   → Verifying sendChannelMessage called with correct team, channel, message...')
  await waitFor(() => {
    expect(mockGraphService.sendChannelMessage).toHaveBeenCalledWith(
      'team-1', 'channel-1', 'Hello from tests'
    );
  });

  expect(
    await screen.findByText(/message sent successfully/i)
  ).toBeInTheDocument();

  console.log('   ✅ RESULT: Message sent to correct team/channel, success confirmation shown')
});

  it('shows licensing guidance when graph returns license error', async () => {
  console.log('\n📋 TEST: License error handling')
  console.log('   → Situation: Account signed in but NO Microsoft 365/Teams license')
  console.log('   → Mocking: getUserTeams() REJECTS with license error message')

  mockGraphService.getUserTeams.mockRejectedValue(
    new Error('Failed to get license information for the user')
  );
  /*mockGraphService.getUserTeams.mockRejectedValue(
    new Error('Some completely different error')); */

  console.log('   → Action: Rendering panel — error should be caught gracefully...')
  render(<TeamsIntegrationPanel />);

  console.log('   → Waiting for license guidance message to appear...')
  expect(
    await screen.findByText(
      /does not have a valid microsoft 365\/teams license/i
    )
  ).toBeInTheDocument();

  console.log('   ✅ RESULT: License error shown with guidance — app did not crash')
});
});
