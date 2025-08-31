import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

export default function AccountSummaryPanel({ summary = {}, metrics = {}, className = '', loading = false }) {
  const safeNumber = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v));
  const fmt = (v, opts = {}) => (v === null || v === undefined || isNaN(v)) ? '--' : `₹${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, ...opts })}`;
  const pct = (v) => (v === null || v === undefined || isNaN(v)) ? '0.00%' : `${Number(v).toFixed(2)}%`;

  const totalBalance = safeNumber(summary.totalBalance);
  const netRealizedPL = safeNumber(summary.netRealizedPL);
  const realisedProfitPercent = safeNumber(summary.realisedProfitPercent);
  const openRisk = safeNumber(metrics.openRisk);
  const totalExposure = safeNumber(metrics.totalExposure);
  const openRiskPct = totalBalance > 0 ? (openRisk / totalBalance) * 100 : 0;

  // Build metric items declaratively to avoid repetition
  const metricItems = useMemo(() => ([
    {
      label: 'Net Realized P&L',
      value: `${netRealizedPL >= 0 ? '+' : ''}${fmt(netRealizedPL)}`,
      accent: netRealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
    },
    { label: 'Available Cash', value: fmt(summary.availableCash) },
    { label: 'Deployed Capital', value: fmt(totalExposure) },
    {
      label: `Total Open Risk (${openRiskPct.toFixed(2)}%)`,
      value: fmt(openRisk)
    },
    { label: 'Total Deposits', value: fmt(summary.totalDeposits) },
    { label: 'Total Withdrawn', value: fmt(summary.totalWithdrawn) },
    { label: 'Starting Account Balance', value: fmt(summary.startingBalance) }
  ]), [netRealizedPL, summary.availableCash, totalExposure, openRiskPct, openRisk, summary.totalDeposits, summary.totalWithdrawn, summary.startingBalance]);

  const ReturnRow = () => (
    <div className="mt-6 border-t pt-3">
      <p className="text-gray-500 text-sm">Current return on net capital invested</p>
      <p className={`font-semibold ${realisedProfitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{realisedProfitPercent >= 0 ? '+' : ''}{pct(realisedProfitPercent)}</p>
    </div>
  );

  const Stat = ({ label, value, accent }) => (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className={`font-semibold ${accent || ''}`}>{value}</p>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`} aria-busy={loading} aria-labelledby="account-summary-heading" role="region">
      <h3 id="account-summary-heading" className="text-md font-semibold mb-4 bg-blue-600 text-white px-3 py-1 inline-block rounded">
        Account Summary
      </h3>
      {loading ? (
        <div className="space-y-6" role="status" aria-live="polite">
          <div>
            <div className="h-3 w-40 bg-blue-100 rounded mb-2 animate-pulse" />
            <div className="h-8 w-48 bg-blue-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-56 bg-blue-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Array.from({length:7}).map((_,i)=>(
              <div key={i} className="space-y-2">
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="uppercase text-xs text-blue-600 font-semibold">Net Account Value</p>
            <p className="text-2xl font-bold text-blue-700">{fmt(totalBalance)}</p>
            <p className={`text-sm font-medium ${netRealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netRealizedPL >= 0 ? '+' : ''}{fmt(netRealizedPL)} ({pct(realisedProfitPercent)})</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {metricItems.map(item => <Stat key={item.label} {...item} />)}
          </div>
          <ReturnRow />
        </>
      )}
    </div>
  );
}

AccountSummaryPanel.propTypes = {
  summary: PropTypes.object,
  metrics: PropTypes.object,
  className: PropTypes.string,
  loading: PropTypes.bool
};
