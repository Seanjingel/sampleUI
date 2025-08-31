import React from 'react';
import { TRADE_TABLE_COLUMNS } from '../../utils/constants';

const SettingsPanel = ({ visibleColumns, setVisibleColumns, entriesPerPage, setEntriesPerPage }) => (
  <div className="p-4 border-b border-gray-200">
    <h3 className="font-medium mb-2">Visible Columns</h3>
    <div className="flex flex-wrap gap-2 mb-4">
      {TRADE_TABLE_COLUMNS.filter(col => col.key !== 'action').map(column => (
        <label key={column.key} className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={visibleColumns.includes(column.key)}
            onChange={() => {
              setVisibleColumns(prev => prev.includes(column.key) ? prev.filter(c => c !== column.key) : [...prev, column.key]);
            }}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{column.label}</span>
        </label>
      ))}
    </div>
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Entries per page</label>
      <select
        value={entriesPerPage}
        onChange={e => setEntriesPerPage(Number(e.target.value))}
        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {[5, 10, 20, 50, 100].map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  </div>
);

export default SettingsPanel;

