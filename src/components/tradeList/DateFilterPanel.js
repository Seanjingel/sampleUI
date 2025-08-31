import React from 'react';
import { DateRangePicker } from 'react-date-range';
import { enUS } from 'date-fns/locale';

const DateFilterPanel = ({ dateRange, setDateRange, onApply, onClear, onClose }) => (
  <div className="p-4 border-b border-gray-200">
    <div className="flex flex-col gap-4">
      <div className="w-full overflow-x-auto md:overflow-visible">
        <DateRangePicker
          onChange={item => setDateRange({ startDate: item.selection.startDate, endDate: item.selection.endDate })}
          showSelectionPreview={true}
          moveRangeOnFirstSelection={false}
          months={window.innerWidth < 768 ? 1 : 2}
          ranges={[{ startDate: dateRange.startDate || new Date(), endDate: dateRange.endDate || new Date(), key: 'selection' }]}
          direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'}
          className="rounded-md border border-gray-300 overflow-hidden max-w-full"
          locale={enUS}
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <button onClick={onApply} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto">Apply Date Range</button>
        <button onClick={onClear} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 w-full sm:w-auto">Clear Date Range</button>
        {onClose && <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 w-full sm:w-auto">Close</button>}
      </div>
    </div>
  </div>
);

export default DateFilterPanel;

