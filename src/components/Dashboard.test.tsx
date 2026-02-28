import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('creates a new task from the quick task form', async () => {
    render(<Dashboard />);

    await userEvent.click(screen.getByRole('button', { name: /new task/i }));
    await userEvent.type(screen.getByPlaceholderText(/task title/i), 'Write automated tests');
    await userEvent.click(screen.getByRole('button', { name: /^create$/i }));

    expect(await screen.findByText('Write automated tests')).toBeInTheDocument();
  });

  it('moves a task from todo to in-progress', async () => {
    render(<Dashboard />);

    await userEvent.click(screen.getByRole('button', { name: /tasks/i }));

    const startButtonsBefore = screen.getAllByRole('button', { name: /start/i });
    expect(startButtonsBefore.length).toBe(1);

    await userEvent.click(startButtonsBefore[0]);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /start/i })).not.toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: /complete/i }).length).toBe(2);
  });
});
