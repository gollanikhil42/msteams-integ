import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from './App';

const { mockAuthService } = vi.hoisted(() => ({
  mockAuthService: {
    initialize: vi.fn(),
    trySilentLogin: vi.fn(),
    isLoginInProgress: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('./services/authService', () => ({
  authService: mockAuthService,
}));

vi.mock('./components/Header', () => ({
  Header: ({ onLogout }: { onLogout: () => void }) => (
    <button onClick={onLogout}>Mock Logout</button>
  ),
}));

vi.mock('./components/Dashboard', () => ({
  Dashboard: () => <div>Mock Dashboard</div>,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthService.initialize.mockResolvedValue(undefined);
    mockAuthService.isLoginInProgress.mockReturnValue(false);
    mockAuthService.logout.mockResolvedValue(undefined);
  });

  it('shows sign-in screen when silent login fails', async () => {
  console.log('\n📋 TEST: Silent login check')
  console.log('   → Situation: User opens app, no previous session exists')
  console.log('   → Mocking: trySilentLogin() returns FALSE (not logged in)')

  mockAuthService.trySilentLogin.mockResolvedValue(false);

  console.log('   → Action: Rendering App component...')
  render(<App />);

  console.log('   → Waiting for Sign In button to appear...')
  expect(
    await screen.findByRole('button', { name: /sign in with microsoft/i })
  ).toBeInTheDocument();

  console.log('   ✅ RESULT: Sign In button visible — correct, user must log in manually')
  });

  it('logs in and renders dashboard', async () => {
  console.log('\n📋 TEST: Full login flow')
  console.log('   → Situation: User clicks Sign In, Microsoft login succeeds')
  console.log('   → Mocking: trySilentLogin() = FALSE, login() = TRUE')

  mockAuthService.trySilentLogin.mockResolvedValue(false);
  mockAuthService.login.mockResolvedValue(true);

  console.log('   → Action: Rendering App, then clicking Sign In button...')
  render(<App />);

  const signInButton = await screen.findByRole('button', {
    name: /sign in with microsoft/i
  });

  console.log('   → Sign In button found, simulating user click...')
  await userEvent.click(signInButton);

  console.log('   → Waiting for Dashboard to appear...')
  await waitFor(() => {
    expect(screen.getByText('Mock Dashboard')).toBeInTheDocument();
  });

  console.log('   ✅ RESULT: Dashboard rendered — login flow works end to end')
  });
});
