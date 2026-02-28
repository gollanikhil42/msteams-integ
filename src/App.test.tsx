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
    mockAuthService.trySilentLogin.mockResolvedValue(false);

    render(<App />);

    expect(await screen.findByRole('button', { name: /sign in with microsoft/i })).toBeInTheDocument();
  });

  it('logs in and renders dashboard', async () => {
    mockAuthService.trySilentLogin.mockResolvedValue(false);
    mockAuthService.login.mockResolvedValue(true);

    render(<App />);

    const signInButton = await screen.findByRole('button', { name: /sign in with microsoft/i });
    await userEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText('Mock Dashboard')).toBeInTheDocument();
    });
  });
});
