import React from 'react';
import { useNavigate } from 'react-router-dom';
import TradeActionMenu from './TradeActionMenu';

export default function MobileTradeList({
  trades,
  allTradesLength,
  formatDate,
  onViewDetails,
  onEdit,
  onDelete,
  onExit,
  onAddTrade,
  onClearFilters,
  filtersApplied
}) {
  const navigate = useNavigate();

  return (
    <div className="block md:hidden">
      {trades.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="p-4 transition-all duration-150 ease-in-out even:bg-white odd:bg-gray-50 hover:bg-blue-50 hover:shadow-md hover:scale-[1.01] rounded-xl mb-4 border border-gray-100 cursor-pointer"
              onClick={() => navigate(`/trade/${trade.id}`)}
            >
              <div className="flex justify-between items-center mb-3">
                <div
                  className="font-semibold text-blue-600 cursor-pointer text-lg"
                >
                  {trade.symbol || '--'}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trade.type === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>{trade.type || '--'}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trade.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : trade.status === 'CLOSED' ? 'bg-green-100 text-green-800' : trade.status === 'CANCELED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>{trade.status || '--'}</span>
                </div>
                <TradeActionMenu trade={trade} onEdit={onEdit} onDelete={onDelete} onExit={onExit} onViewDetails={onViewDetails} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Entry Date:</span>
                  <div className="font-medium">{formatDate(trade.entryDate)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Exit Date:</span>
                  <div className="font-medium">{formatDate(trade.exitDate)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Entry Price:</span>
                  <div className="font-medium">{trade.entryPrice ? `$${parseFloat(trade.entryPrice).toFixed(2)}` : '--'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Exit Price:</span>
                  <div className="font-medium">{trade.exitPrice ? `$${parseFloat(trade.exitPrice).toFixed(2)}` : '--'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Quantity:</span>
                  <div className="font-medium">{trade.quantity || '--'}</div>
                </div>
                <div>
                  <span className="text-gray-500">P/L:</span>
                  <div className={`font-medium flex items-center ${trade.profitOrLoss && parseFloat(trade.profitOrLoss) > 0 ? 'text-green-600' : (trade.profitOrLoss && parseFloat(trade.profitOrLoss) < 0 ? 'text-red-600' : 'text-gray-700')}`}> 
                    {trade.profitOrLoss ? `$${Math.abs(parseFloat(trade.profitOrLoss)).toFixed(2)}` : '--'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center">
          {allTradesLength === 0 ? (
            <div className="py-8">
              <p className="font-medium mb-2">No trades found</p>
              <p className="text-gray-400 mb-4">Add your first trade to get started</p>
              <button onClick={onAddTrade} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-gray-700">Add Trade</button>
            </div>
          ) : (
            <div className="py-8">
              <p className="font-medium">No trades match your filters</p>
              <button onClick={onClearFilters} className="px-4 py-2 mt-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Clear Filters</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
