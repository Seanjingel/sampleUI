import React, { useRef, useEffect } from 'react';
import {Download, Calendar, ChevronDown, Search, Filter, Settings} from 'lucide-react';

export default function ActionToolbar({
  searchQuery,
  onSearchChange,
  dateRange,
  onToggleDatePicker,
  onToggleFilters,
  statusFilter,
  typeFilter,
  exportOpen,
  onToggleExport,
  onDownloadCSV,
  onCSVImport,
  showSettings,
  onToggleSettings,
  showDatePicker,
  showFilters
}) {
  const exportRef = useRef(null);

  useEffect(() => {
    if (!exportOpen) return;
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        onToggleExport();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportOpen, onToggleExport]);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-200">
      {/* Search */}
      <div className="relative w-full md:w-64 mb-4 md:mb-0">
        <input
          type="text"
          placeholder="Search symbol..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 shadow-sm transition-all duration-200 hover:bg-white"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"/>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onToggleDatePicker}
          className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-200 hover:shadow"
        >
          <Calendar size={16}/>
          <span>Date</span>
          {dateRange.start && dateRange.end && (
            <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
              {`${dateRange.start} - ${dateRange.end}`}
            </span>
          )}
        </button>

        <button
          onClick={onToggleFilters}
          className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-200 hover:shadow"
        >
          <Filter size={16}/>
          <span>Filter</span>
          {(statusFilter || typeFilter) && (
            <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
              {(statusFilter && typeFilter) ? '2' : '1'}
            </span>
          )}
        </button>

        <div className="relative" ref={exportRef}>
          <button
            onClick={onToggleExport}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-200 hover:shadow"
          >
            <Download size={16}/>
            <span>Export</span>
            <ChevronDown size={16}/>
          </button>
          {exportOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 animate-fadeIn">
              <ul className="py-1">
                <li>
                  <button
                    onClick={onDownloadCSV}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                  >
                    Export as CSV
                  </button>
                </li>
                <li>
                  <label
                    htmlFor="csv-upload"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 cursor-pointer"
                  >
                    Import CSV
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={onCSVImport}
                      className="hidden"
                    />
                  </label>
                </li>
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={onToggleSettings}
          className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          <Settings size={16}/>
        </button>
      </div>
    </div>
  );
}
