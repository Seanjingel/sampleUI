import React, { useState } from 'react';
import useTradeList from '../hooks/tradeList/useTradeList';
import Pagination from '../components/Pagination';
import ToastNotification from '../components/ToastNotification';
import ExitTradeModal from '../components/modals/ExitTradeModal';
import TradeModal from "../components/modals/TradeModal";
import TradeDetailsModal from '../components/modals/TradeDetailsModal';
import SummaryBar from '../components/tradeList/SummaryBar';
import ActionToolbar from '../components/tradeList/ActionToolbar';
import MobileTradeList from '../components/tradeList/MobileTradeList';
import DesktopTradeTable from '../components/tradeList/DesktopTradeTable';
import DateFilterPanel from '../components/tradeList/DateFilterPanel';
import SettingsPanel from '../components/tradeList/SettingsPanel';
import FilterPanel from '../components/tradeList/FilterPanel';
import { format } from 'date-fns';
import { deleteTrade, importTrades, exitTrade as exitTradeApi } from '../api/tradeService';

// Helper to format dates
const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const TradeList = () => {
    // Use custom hook for all trade logic
    const {
        trades,
        currentTrades,
        loading,
        fetchError,
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        sortKey,
        setSortKey,
        sortOrder,
        setSortOrder,
        dateRange,
        setDateRange,
        currentPage,
        setCurrentPage,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        visibleColumns,
        setVisibleColumns,
        entriesPerPage,
        setEntriesPerPage,
        fetchTrades,
        totalPages,
    } = useTradeList();

    // UI state for modals and panels
    const [showModal, setShowModal] = useState(false);
    const [editTrade, setEditTrade] = useState(null);
    const [showExitModal, setShowExitModal] = useState(false);
    const [exitingTrade, setExitingTrade] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsTrade, setDetailsTrade] = useState(null);
    const [exportOpen, setExportOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Handlers for trade actions
    const handleSort = (key) => {
        if (sortKey === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortOrder('asc'); }
    };
    const handleDelete = (id) => { deleteTrade(id).then(fetchTrades); };
    const handleEdit = (trade) => { setEditTrade(trade); setShowModal(true); };
    const handleAddTrade = () => { setEditTrade(null); setShowModal(true); };
    const handleExit = (trade) => { setExitingTrade(trade); setShowExitModal(true); };
    const handleExitSubmit = async (exitData) => {
        try {
            await exitTradeApi(exitData.tradeId, { price: exitData.exitPrice, quantity: exitData.exitQty, date: exitData.exitDate });
            fetchTrades(); setShowExitModal(false); ToastNotification.success('Trade exited successfully!');
        } catch (error) { ToastNotification.error('Failed to exit trade!'); }
    };
    const handleViewDetails = (trade) => { setDetailsTrade(trade); setShowDetailsModal(true); };
    const handleCSVImport = (e) => {
        const file = e.target.files[0]; if (!file) return; const fd = new FormData(); fd.append('file', file); importTrades(fd).then(fetchTrades);
    };
    const handleDownloadCSV = () => {
        // ...existing code for CSV download...
    };
    const clearAllFilters = () => {
        setSearchQuery('');
        setDateRange({start: '', end: '', startDate: null, endDate: null});
        setStatusFilter('');
        setTypeFilter('');
    };
    const applyDateFilter = () => {
        if (dateRange.startDate && dateRange.endDate) {
            setDateRange({
                start: format(dateRange.startDate, 'yyyy-MM-dd'),
                end: format(dateRange.endDate, 'yyyy-MM-dd'),
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });
        }
        setShowDatePicker(false);
    };

    // Summary calculation
    const summary = React.useMemo(() => {
        let open = 0, closed = 0, canceled = 0, totalPL = 0, anyPL = false; const total = trades.length;
        trades.forEach(t => {
            if (t.status === 'OPEN') open++; else if (t.status === 'CLOSED') closed++; else if (t.status === 'CANCELED') canceled++;
            const v = parseFloat(t.profitOrLoss); if (!isNaN(v)) { totalPL += v; anyPL = true; }
        });
        return { total, open, closed, canceled, totalPL, anyPL };
    }, [trades]);

    return (
        <div className="p-4 md:p-6">
            <SummaryBar summary={summary} />
            {loading && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">Loading trades...</div>}
            {fetchError && !loading && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{fetchError}</div>}

            {/* Show Add Trade button if no trades and not loading/error */}
            {!loading && !fetchError && trades.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="mb-4 text-lg text-gray-700">You haven't added any trades yet.</div>
                    <div className="mb-4 text-gray-700">Start by adding your first trade to see analytics and insights.</div>
                    <button
                        onClick={handleAddTrade}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Add Your First Trade
                    </button>
                </div>
            )}

            {/* Only show trade list/table if there are trades */}
            {trades.length > 0 && (
                <>
                    <div className="bg-white rounded-lg shadow-md mb-6">
                        <ActionToolbar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            dateRange={dateRange}
                            onToggleDatePicker={() => setShowDatePicker(!showDatePicker)}
                            onToggleFilters={() => setShowFilters(!showFilters)}
                            statusFilter={statusFilter}
                            typeFilter={typeFilter}
                            exportOpen={exportOpen}
                            onToggleExport={() => setExportOpen(!exportOpen)}
                            onDownloadCSV={handleDownloadCSV}
                            onCSVImport={handleCSVImport}
                            showSettings={showSettings}
                            onToggleSettings={() => setShowSettings(!showSettings)}
                        />
                        {showDatePicker && (
                            <DateFilterPanel
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                                onApply={applyDateFilter}
                                onClear={() => { setDateRange({start: '', end: ''}); setShowDatePicker(false); }}
                                onClose={() => setShowDatePicker(false)}
                            />
                        )}
                        {showFilters && (
                            <FilterPanel
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                typeFilter={typeFilter}
                                setTypeFilter={setTypeFilter}
                                onClear={clearAllFilters}
                            />
                        )}
                        {showSettings && (
                            <SettingsPanel
                                visibleColumns={visibleColumns}
                                setVisibleColumns={setVisibleColumns}
                                entriesPerPage={entriesPerPage}
                                setEntriesPerPage={n => { setEntriesPerPage(n); setCurrentPage(1); }}
                            />
                        )}
                    </div>

                    <div className="rounded-lg border-2 shadow-sm overflow-hidden bg-white">
                        <MobileTradeList
                            trades={currentTrades}
                            allTradesLength={trades.length}
                            formatDate={formatDate}
                            onViewDetails={handleViewDetails}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onExit={handleExit}
                            onAddTrade={handleAddTrade}
                            onClearFilters={clearAllFilters}
                            filtersApplied={!!(statusFilter || typeFilter || debouncedSearch)}
                        />
                        <DesktopTradeTable
                            trades={currentTrades}
                            visibleColumns={visibleColumns}
                            onSort={handleSort}
                            sortKey={sortKey}
                            sortOrder={sortOrder}
                            formatDate={formatDate}
                            onViewDetails={handleViewDetails}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onExit={handleExit}
                        />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
                        <div className="text-sm text-gray-700 text-right min-w-[180px]">
                            {(() => {
                                const startIdx = (currentPage - 1) * entriesPerPage + 1;
                                const endIdx = Math.min(currentPage * entriesPerPage, trades.length);
                                if (trades.length === 0) {
                                    return 'Showing 0 of 0 trades';
                                } else {
                                    return `Showing trades ${startIdx}-${endIdx} of ${trades.length}`;
                                }
                            })()}
                        </div>
                    </div>
                </>
            )}

            {showModal && (
                <TradeModal isOpen={showModal} onClose={() => setShowModal(false)} trade={editTrade} onSave={fetchTrades} />
            )}
            {showExitModal && exitingTrade && (
                <ExitTradeModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} trade={exitingTrade} onSubmit={handleExitSubmit} />
            )}
            {showDetailsModal && detailsTrade && (
                <TradeDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} trade={detailsTrade} />
            )}
        </div>
    );
};

export default TradeList;
