import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TRADE_TABLE_COLUMNS } from '../utils/constants';
import { getTradeById } from '../api/tradeService';

const extraFields = [
  { key: 'notes', label: 'Notes' },
  { key: 'tags', label: 'Tags' },
  { key: 'setup', label: 'Setup' },
  { key: 'mood', label: 'Mood' },
  { key: 'target', label: 'Target' }
];

function getColumnLabel(key) {
  const col = TRADE_TABLE_COLUMNS.find(c => c.key === key);
  return col && col.label ? col.label : key.charAt(0).toUpperCase() + key.slice(1);
}
function getColumnValue(trade, key) {
  if (key === 'entryDate' || key === 'exitDate') return trade[key] ? new Date(trade[key]).toLocaleString() : '--';
  if (key === 'entryPrice' || key === 'exitPrice' || key === 'stopLoss' || key === 'target') return trade[key] ? `₹${parseFloat(trade[key]).toFixed(2)}` : '--';
  if (key === 'profitOrLoss') {
    if (trade.profitOrLoss === undefined || trade.profitOrLoss === null) return '--';
    return `₹${parseFloat(trade.profitOrLoss).toFixed(2)}`;
  }
  if (key === 'quantity' || key === 'openQuantity') return trade[key] !== undefined ? trade[key] : '--';
  return trade[key] || '--';
}

const TradeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrade() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTradeById(id);
        console.log('TradeDetailsPage API response:', data);
        setTrade(data);
      } catch (err) {
        setError('Trade not found');
      } finally {
        setLoading(false);
      }
    }
    fetchTrade();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!trade) return null;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 sm:p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Trade Details</h2>
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 text-xl sm:text-2xl font-bold transition" type="button">×</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-2 sm:mb-4">
        {TRADE_TABLE_COLUMNS.filter(col => col.key !== 'action').map(col => (
          <div key={col.key} className="bg-gray-50 rounded-md p-3 flex flex-col border border-gray-100">
            <span className="text-gray-500 text-xs mb-1">{getColumnLabel(col.key)}</span>
            <span className={`font-medium text-base text-gray-700`}>{getColumnValue(trade, col.key)}</span>
          </div>
        ))}
        {extraFields.map(field => (
          <div key={field.key} className="bg-gray-50 rounded-md p-3 flex flex-col border border-gray-100">
            <span className="text-gray-500 text-xs mb-1">{field.label}</span>
            <span className="font-medium text-base text-gray-700">{trade[field.key] || '--'}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4 sm:mt-6">
        <button onClick={() => navigate(-1)} className="px-4 sm:px-6 py-2 rounded-md bg-gray-800 text-white font-semibold hover:bg-gray-900 shadow transition">Back</button>
      </div>
    </div>
  );
};

export default TradeDetailsPage;
