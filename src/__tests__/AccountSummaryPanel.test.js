import React from 'react';
import { render, screen } from '@testing-library/react';
import AccountSummaryPanel from '../components/overview/AccountSummaryPanel';

describe('AccountSummaryPanel', () => {
  const summary = {
    totalBalance: 100000,
    netRealizedPL: 2500,
    realisedProfitPercent: 2.5,
    availableCash: 75000,
    totalDeposits: 90000,
    totalWithdrawn: 0,
    startingBalance: 15000
  };
  const metrics = { openRisk: 1000, totalExposure: 40000 };

  test('renders skeleton when loading', () => {
    render(<AccountSummaryPanel loading />);
    const region = screen.getByRole('region', { name: /account summary/i });
    expect(region).toHaveAttribute('aria-busy', 'true');
    // Net Account Value label placeholder present
    expect(screen.getAllByRole('status').length).toBeGreaterThanOrEqual(1);
  });

  test('renders data when not loading', () => {
    render(<AccountSummaryPanel summary={summary} metrics={metrics} />);
    expect(screen.getByText(/Net Account Value/i)).toBeInTheDocument();
    expect(screen.getByText(/₹100,000.00/)).toBeInTheDocument();
    expect(screen.getByText(/Net Realized P&L/i)).toBeInTheDocument();
  });
});

