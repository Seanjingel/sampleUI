import React from 'react';

const TradeDetailsModal = ({ isOpen, onClose, trade }) => {
  if (!isOpen || !trade) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 px-2 sm:px-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg p-4 sm:p-8 relative border border-blue-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-700 flex items-center gap-2">
            <span className="inline-block w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-lg">{trade.symbol?.[0] || '?'}</span>
            Trade Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-blue-600 text-xl sm:text-2xl font-bold transition" type="button">×</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-2 sm:mb-4">
          <div className="space-y-2">
            <div><span className="font-semibold text-gray-600">Symbol:</span> <span className="text-blue-700 font-bold">{trade.symbol || '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Type:</span> <span className={`font-bold ${trade.type === 'buy' ? 'text-green-600' : trade.type === 'sell' ? 'text-red-600' : 'text-gray-500'}`}>{trade.type ? trade.type.toUpperCase() : '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Status:</span> <span className={`font-bold ${trade.status === 'open' ? 'text-red-600' : trade.status === 'closed' ? 'text-green-600' : 'text-gray-500'}`}>{trade.status ? trade.status.toUpperCase() : '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Entry Price:</span> <span className="text-gray-700">{trade.entryPrice || '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Entry Date:</span> <span className="text-gray-700">{trade.entryDate ? new Date(trade.entryDate).toLocaleString() : '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Quantity:</span> <span className="text-gray-700">{trade.quantity || '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Open Quantity:</span> <span className="text-gray-700">{trade.openQuantity !== undefined ? trade.openQuantity : '--'}</span></div>
          </div>
          <div className="space-y-2">
            <div><span className="font-semibold text-gray-600">Stop Loss:</span> <span className="text-red-600 font-bold">{trade.stopLoss || '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Target:</span> <span className="text-green-600 font-bold">{trade.target || '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Exit Price:</span> <span className="text-gray-700">{trade.exitPrice || '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Exit Date:</span> <span className="text-gray-700">{trade.exitDate ? new Date(trade.exitDate).toLocaleString() : '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Profit/Loss:</span> <span className={`font-bold ${trade.profitOrLoss > 0 ? 'text-green-600' : trade.profitOrLoss < 0 ? 'text-red-600' : 'text-gray-700'}`}>{trade.profitOrLoss !== undefined ? `₹${trade.profitOrLoss}` : '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Notes:</span> <span className="text-gray-700">{trade.notes || '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Tags:</span> <span className="text-gray-700">{trade.tags || '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Setup:</span> <span className="text-gray-700">{trade.setup || '--'}</span></div>
            <div><span className="font-semibold text-gray-600">Mood:</span> <span className="text-gray-700">{trade.mood || '--'}</span></div>
          </div>
        </div>
        <div className="flex justify-end mt-4 sm:mt-6">
          <button onClick={onClose} className="px-4 sm:px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow transition">Close</button>
        </div>
      </div>
    </div>
  );
};

export default TradeDetailsModal;
