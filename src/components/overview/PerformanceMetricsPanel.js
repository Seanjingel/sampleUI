import React from 'react';
import PropTypes from 'prop-types';

export default function PerformanceMetricsPanel({ metrics = {}, loading = false, className = '' }) {
  const fmt = (v) => (v === null || v === undefined || isNaN(v)) ? '--' : `₹${Math.abs(Number(v)).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}`;
  const signed = (v) => (v === null || v === undefined || isNaN(v)) ? '--' : `${v>=0?'+':''}₹${Math.abs(Number(v)).toLocaleString(undefined,{minimumFractionDigits:2})}`;
  const timeFmt = (days) => {
    if (!isFinite(days)) return '--';
    const totalMinutes = Math.round(days * 24 * 60);
    const d = Math.floor(totalMinutes / (24*60));
    const m = totalMinutes % (24*60);
    const h = Math.floor(m / 60);
    const remM = m % 60;
    if (d>0) return `${d}d ${h}h` + (remM?` ${remM}m`:'' );
    if (h>0) return `${h}h ${remM}m`;
    return `${remM}m`;
  };
  const skeletonItems = 20; // number of metric boxes
  const avgWinHold = metrics.avgWinHoldDays ?? metrics.avgWinningHoldingDays;
  const largestProfitDayVal = metrics.largestProfitDay ?? metrics.largestProfitableDay;
  const largestLossDayVal = metrics.largestLossDay ?? metrics.largestLosingDay;
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`} aria-busy={loading} aria-labelledby="performance-metrics-heading" role="region">
      <h3 id="performance-metrics-heading" className="text-lg font-semibold mb-3">Performance Metrics</h3>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" role="status" aria-live="polite">
          {Array.from({length: skeletonItems}).map((_,i)=>(
            <div key={i} className="space-y-2">
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-500">Best Trade</p><p className="font-semibold text-green-600">{signed(metrics.bestTrade)}</p></div>
          <div><p className="text-gray-500">Average Winning Trade</p><p className="font-semibold text-green-600">{signed(metrics.avgWinningTrade)}</p></div>
          <div><p className="text-gray-500">Number of Winning Trades</p><p className="font-semibold">{metrics.winCount}</p></div>
          <div><p className="text-gray-500">Avg Holding (Winners)</p><p className="font-semibold">{timeFmt(avgWinHold)}</p></div>
          <div><p className="text-gray-500">Avg Winning Day P&L</p><p className="font-semibold text-green-600">{signed(metrics.avgWinningDayPL)}</p></div>
          <div><p className="text-gray-500">Largest Profitable Day</p><p className="font-semibold text-green-600">{signed(largestProfitDayVal)}</p></div>
          <div><p className="text-gray-500">Long Performance</p><p className="font-semibold text-green-600">{signed(metrics.longPerformance)}</p></div>
            <div><p className="text-gray-500">Profit Factor</p><p className="font-semibold">{metrics.profitFactor>0?metrics.profitFactor.toFixed(2):'N/A'}</p></div>
          <div><p className="text-gray-500">Worst Trade</p><p className={`font-semibold ${metrics.worstTrade<0?'text-red-600':'text-gray-600'}`}>{metrics.worstTrade===0?'No losses':signed(metrics.worstTrade)}</p></div>
          <div><p className="text-gray-500">Average Losing Trade</p><p className="font-semibold text-red-600">{signed(metrics.avgLosingTrade)}</p></div>
          <div><p className="text-gray-500">Number of Losing Trades</p><p className="font-semibold">{metrics.lossCount}</p></div>
          <div><p className="text-gray-500">Avg Losing Day P&L</p><p className="font-semibold text-red-600">{signed(metrics.avgLosingDayPL)}</p></div>
          <div><p className="text-gray-500">Largest Losing Day</p><p className="font-semibold text-red-600">{signed(largestLossDayVal)}</p></div>
          <div><p className="text-gray-500">Consecutive Wins</p><p className="font-semibold">{metrics.consecutiveWins}</p></div>
          <div><p className="text-gray-500">Consecutive Losses</p><p className="font-semibold">{metrics.consecutiveLosses}</p></div>
          <div><p className="text-gray-500">Avg. Time in Trade</p><p className="font-semibold">{timeFmt(metrics.avgTimeInTrade)}</p></div>
          <div><p className="text-gray-500">Short Performance</p><p className={`font-semibold ${metrics.shortPerformance>=0?'text-green-600':'text-red-600'}`}>{signed(metrics.shortPerformance)}</p></div>
          <div><p className="text-gray-500">Risk:Reward Ratio</p><p className="font-semibold">{metrics.riskReward>0?metrics.riskReward.toFixed(2):'N/A'}</p></div>
          <div><p className="text-gray-500">Total Charges</p><p className="font-semibold">{fmt(metrics.totalCharges)}</p></div>
          <div><p className="text-gray-500">Total Brokerage</p><p className="font-semibold">{fmt(metrics.totalBrokerage)}</p></div>
        </div>
      )}
    </div>
  );
 }

PerformanceMetricsPanel.propTypes = {
  metrics: PropTypes.object,
  loading: PropTypes.bool,
  className: PropTypes.string
};
