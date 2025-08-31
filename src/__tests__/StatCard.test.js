import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from '../components/overview/StatCard';

describe('StatCard', () => {
  test('renders label and value', () => {
    render(<StatCard label="Open Trades" value={5} />);
    expect(screen.getByText(/Open Trades/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('shows skeleton when loading', () => {
    render(<StatCard label="Win Rate" loading />);
    const group = screen.getByRole('group', { name: /win rate/i });
    expect(group).toHaveAttribute('aria-busy', 'true');
    // value should not render
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});

