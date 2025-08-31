import React from 'react';

// Props: summary {total,open,closed,canceled,totalPL,anyPL}
export default function SummaryBar({ summary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <div className="p-3 bg-white border rounded-lg shadow-sm">
        <p className="text-xs text-gray-500">Total Trades</p>
        <p className="text-lg font-semibold">{summary.total}</p>
      </div>
      <div className="p-3 bg-white border rounded-lg shadow-sm">
        <p className="text-xs text-gray-500">Open</p>
        <p className="text-lg font-semibold text-blue-600">{summary.open}</p>
      </div>
      <div className="p-3 bg-white border rounded-lg shadow-sm">
        <p className="text-xs text-gray-500">Closed</p>
        <p className="text-lg font-semibold text-green-600">{summary.closed}</p>
      </div>
      <div className="p-3 bg-white border rounded-lg shadow-sm hidden md:block">
        <p className="text-xs text-gray-500">Canceled</p>
        <p className="text-lg font-semibold text-red-600">{summary.canceled}</p>
      </div>
      <div className="p-3 bg-white border rounded-lg shadow-sm col-span-2 md:col-span-1">
        <p className="text-xs text-gray-500">Net P/L</p>
        <p className={`text-lg font-semibold ${!summary.anyPL ? 'text-gray-700' : (summary.totalPL > 0 ? 'text-green-600' : summary.totalPL < 0 ? 'text-red-600' : 'text-gray-700')}`}>
          {!summary.anyPL ? '--' : `$${summary.totalPL.toFixed(2)}`}
        </p>
      </div>
    </div>
  );
}
