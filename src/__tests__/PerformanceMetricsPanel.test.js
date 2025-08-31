import React from 'react';
import { render, screen } from '@testing-library/react';
import PerformanceMetricsPanel from '../components/overview/PerformanceMetricsPanel';

const baseMetrics = {
  bestTrade: 2280,
  avgWinningTrade: 2280,
  winCount: 1,
  avgWinHoldDays: 0.32,
  avgWinningDayPL: 2280,
  largestProfitDay: 2280,
  longPerformance: 2280,
  profitFactor: 0,
  worstTrade: 0,
  avgLosingTrade: 0,
  lossCount: 0,
  avgLosingDayPL: 0,
  largestLossDay: 0,
  consecutiveWins: 1,
  consecutiveLosses: 0,
  avgTimeInTrade: 0.32,
  shortPerformance: 0,
  riskReward: 0,
  totalCharges: 0,
  totalBrokerage: 0
};

describe('PerformanceMetricsPanel', () => {
  test('renders skeleton when loading', () => {
    render(<PerformanceMetricsPanel loading />);
    const region = screen.getByRole('region', { name: /performance metrics/i });
    expect(region).toHaveAttribute('aria-busy', 'true');
  });

  test('renders metrics when not loading', () => {
    render(<PerformanceMetricsPanel metrics={baseMetrics} />);
    expect(screen.getByText(/Best Trade/i)).toBeInTheDocument();
    expect(screen.getByText(/\+₹2,280.00/)).toBeInTheDocument();
    expect(screen.getByText(/Number of Winning Trades/i)).toBeInTheDocument();
  });

  test('fallback property names work', () => {
    const altMetrics = { ...baseMetrics, avgWinHoldDays: undefined, avgWinningHoldingDays: 0.5, largestProfitDay: undefined, largestProfitableDay: 3000, largestLossDay: undefined, largestLosingDay: -100 };
    render(<PerformanceMetricsPanel metrics={altMetrics} />);
    expect(screen.getByText(/Largest Profitable Day/i).nextSibling.textContent).toMatch(/₹3,000.00/);
  });
});

