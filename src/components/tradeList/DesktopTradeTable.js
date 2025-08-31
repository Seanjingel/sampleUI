import React from 'react';
import { useNavigate } from 'react-router-dom';
import TradeActionMenu from './TradeActionMenu';
import { TRADE_TABLE_COLUMNS } from '../../utils/constants';

export default function DesktopTradeTable({
  trades,
  visibleColumns,
  onSort,
  sortKey,
  sortOrder,
  formatDate,
  onViewDetails,
  onEdit,
  onDelete,
  onExit,
}) {
  const navigate = useNavigate();

  // Helper to get label from constants
  function getColumnLabel(key) {
    const col = TRADE_TABLE_COLUMNS.find(c => c.key === key);
    return col && col.label ? col.label : key;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 hidden md:table">
      <thead className="bg-gray-100">
        <tr>
          {visibleColumns.filter(k => k !== 'action').map((key) => (
            <th
              key={key}
              onClick={() => onSort(key)}
              className={`px-3 py-3 text-left text-xs font-medium text-gray-900 tracking-wider cursor-pointer${key === 'symbol' ? ' sticky left-0 z-20' : ''}`}
              style={key === 'symbol' ? {left:0,minWidth:'80px',maxWidth:'80px'}:{} }
            >
              <div className="flex items-center space-x-1">
                <span>{getColumnLabel(key)}</span>
                {sortKey === key && (<span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>)}
              </div>
            </th>
          ))}
          <th className="px-3 py-3 text-center text-xs font-medium text-gray-900  tracking-wider sticky right-0 z-20" style={{right:0,minWidth:'80px'}}>Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {trades.length > 0 ? trades.map((trade, idx) => (
          <tr
            key={trade.id}
            className={`even:bg-white odd:bg-gray-50 hover:bg-blue-50`}
          >
            {visibleColumns.filter(k => k !== 'action').map(key => {
              if (key === 'symbol') {
                return (
                  <td key={key} className="sticky left-0 z-20 px-3 py-2 font-semibold text-sm" style={{left:0,minWidth:'80px',maxWidth:'80px'}} onClick={() => navigate(`/trade/${trade.id}`)}>
                    <div className="truncate text-blue-600 hover:text-blue-800 cursor-pointer">{trade.symbol || '--'}</div>
                  </td>
                );
              }
              if (key === 'type') {
                const bg = trade.type === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800';
                return <td key={key} className="px-3 py-2 text-sm"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}>{trade.type || '--'}</span></td>;
              }
              if (key === 'status') {
                let cls = 'bg-gray-100 text-gray-600';
                if (trade.status === 'OPEN') cls = 'bg-blue-100 text-blue-800';
                else if (trade.status === 'CLOSED') cls = 'bg-green-100 text-green-800';
                else if (trade.status === 'CANCELED') cls = 'bg-red-100 text-red-800';
                return <td key={key} className="px-3 py-2 text-sm"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{trade.status || '--'}</span></td>;
              }
              if (key === 'profitOrLoss') {
                const val = trade.profitOrLoss ? parseFloat(trade.profitOrLoss) : null;
                const color = val > 0 ? 'text-green-600' : val < 0 ? 'text-red-600' : 'text-gray-700';
                return <td key={key} className={`px-3 py-2 text-sm font-medium ${color}`}>{val === null ? '--' : `$${Math.abs(val).toFixed(2)}`}</td>;
              }
              if (key === 'entryDate' || key === 'exitDate') {
                return <td key={key} className="px-3 py-2 text-sm">{formatDate(trade[key])}</td>;
              }
              return <td key={key} className="px-3 py-2 text-sm">{trade[key] || '--'}</td>;
            })}
            <td className="px-3 py-2 text-sm text-center">
              <TradeActionMenu trade={trade} onEdit={onEdit} onDelete={onDelete} onExit={onExit} onViewDetails={onViewDetails} />
            </td>
          </tr>
        )) : (
          <tr>
            <td className="px-3 py-4 text-center text-gray-500" colSpan={visibleColumns.length}>No trades found for the current filters.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
