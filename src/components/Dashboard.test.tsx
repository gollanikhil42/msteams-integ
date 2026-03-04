import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('creates a new task from the quick task form', async () => {
  console.log('\n📋 TEST: Task creation')
  console.log('   → Situation: User wants to add a new task to their board')

  console.log('   → Action: Rendering Dashboard...')
  render(<Dashboard />);

  console.log('   → Clicking "+ New Task" button to open form...')
  await userEvent.click(screen.getByRole('button', { name: /new task/i }));

  console.log('   → Typing task title: "Write automated tests"')
  await userEvent.type(
    screen.getByPlaceholderText(/task title/i),
    'Write automated tests'
  );

  console.log('   → Clicking Create button to submit...')
  await userEvent.click(screen.getByRole('button', { name: /^create$/i }));

  console.log('   → Checking task appears in the list...')
  expect(
    await screen.findByText('Write automated tests')
  ).toBeInTheDocument();

  console.log('   ✅ RESULT: Task "Write automated tests" visible on screen — creation works')
});

  it('moves a task from todo to in-progress', async () => {
  console.log('\n📋 TEST: Task status transition (todo → in-progress)')
  console.log('   → Situation: User starts working on a task')

  console.log('   → Action: Rendering Dashboard...')
  render(<Dashboard />);

  console.log('   → Navigating to Tasks tab to see Kanban board...')
  await userEvent.click(screen.getByRole('button', { name: /tasks/i }));

  const startButtonsBefore = screen.getAllByRole('button', { name: /start/i });
  console.log(`   → Found ${startButtonsBefore.length} Start button(s) — 1 task in TODO`)
  expect(startButtonsBefore.length).toBe(1);

  console.log('   → Clicking Start on the todo task (API Integration)...')
  await userEvent.click(startButtonsBefore[0]);

  console.log('   → Verifying: Start buttons gone, Complete buttons increased...')
  await waitFor(() => {
    expect(
      screen.queryByRole('button', { name: /start/i })
    ).not.toBeInTheDocument();
  });

  expect(
    screen.getAllByRole('button', { name: /complete/i }).length
  ).toBe(2);

  console.log('   ✅ RESULT: 0 Start buttons, 2 Complete buttons — task moved to in-progress')
  });
});
