import React from 'react';
import { TRADE_STATUS, TRADE_TYPES } from '../../utils/constants';
import { X } from 'lucide-react';

const FilterPanel = ({ statusFilter, setStatusFilter, typeFilter, setTypeFilter, onClear }) => (
  <div className="p-4 border-b border-gray-200">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trade Status</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          {TRADE_STATUS.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trade Type</label>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          {TRADE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      <div className="flex items-end sm:col-span-2 md:col-span-1">
        <button onClick={onClear} className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 w-full">
          <X size={16}/> <span>Clear All Filters</span>
        </button>
      </div>
    </div>
  </div>
);

export default FilterPanel;
