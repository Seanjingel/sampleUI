import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllTrades, getTradeByRange } from '../../api/tradeService';
import { TRADE_TABLE_COLUMNS, TRADE_PER_PAGE } from '../../utils/constants';
import { sortTrades } from '../../utils/tradeHelpers';
import ToastNotification from '../../components/ToastNotification';

const LS_KEYS = {
  visibleColumns: 'tradeList.visibleColumns',
  statusFilter: 'tradeList.statusFilter',
  typeFilter: 'tradeList.typeFilter',
  entriesPerPage: 'tradeList.entriesPerPage',
};

const extractTrades = (res) => Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);

export default function useTradeList() {
  const [trades, setTrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortKey, setSortKey] = useState('entryDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(() => (typeof window === 'undefined') ? '' : (localStorage.getItem(LS_KEYS.statusFilter) || ''));
  const [typeFilter, setTypeFilter] = useState(() => (typeof window === 'undefined') ? '' : (localStorage.getItem(LS_KEYS.typeFilter) || ''));
  const [visibleColumns, setVisibleColumns] = useState(() => {
    if (typeof window === 'undefined') return TRADE_TABLE_COLUMNS ? TRADE_TABLE_COLUMNS.map(col => col.key) : [];
    try {
      const stored = localStorage.getItem(LS_KEYS.visibleColumns);
      if (stored) return JSON.parse(stored);
    } catch (_) { /* ignore */ }
    return TRADE_TABLE_COLUMNS ? TRADE_TABLE_COLUMNS.map(col => col.key) : [];
  });
  const defaultEntries = typeof window === 'undefined' ? 10 : Number(localStorage.getItem(LS_KEYS.entriesPerPage)) || TRADE_PER_PAGE;
  const [entriesPerPage, setEntriesPerPage] = useState(defaultEntries);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Persist settings
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LS_KEYS.visibleColumns, JSON.stringify(visibleColumns)); }, [visibleColumns]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LS_KEYS.statusFilter, statusFilter); }, [statusFilter]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LS_KEYS.typeFilter, typeFilter); }, [typeFilter]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LS_KEYS.entriesPerPage, entriesPerPage); }, [entriesPerPage]);

  const fetchTrades = useCallback(() => {
    setLoading(true); setFetchError(null);
    const handleError = (error) => {
      if (error.response?.status !== 404 && error.response?.status !== 204) {
        setFetchError('Unable to load trades');
        ToastNotification.error('Unable to connect to server. Please try again.');
      } else {
        setTrades([]);
      }
    };
    const done = () => setLoading(false);
    if (dateRange.start && dateRange.end) {
      getTradeByRange(dateRange.start, dateRange.end).then(res => setTrades(extractTrades(res))).catch(handleError).finally(done);
    } else {
      getAllTrades().then(res => setTrades(extractTrades(res))).catch(handleError).finally(done);
    }
  }, [dateRange]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter, typeFilter, sortKey, sortOrder, dateRange]);
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 300); return () => clearTimeout(t); }, [searchQuery]);

  const processedTrades = useMemo(() => {
    let filtered = [...trades];
    if (debouncedSearch) filtered = filtered.filter(t => t.symbol.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (statusFilter) filtered = filtered.filter(t => t.status?.toLowerCase() === statusFilter.toLowerCase());
    if (typeFilter) filtered = filtered.filter(t => t.type?.toLowerCase() === typeFilter.toLowerCase());
    return sortTrades(filtered, sortKey, sortOrder);
  }, [trades, debouncedSearch, statusFilter, typeFilter, sortKey, sortOrder]);

  const totalPages = useMemo(() => Math.ceil(processedTrades.length / entriesPerPage), [processedTrades.length, entriesPerPage]);
  const currentTrades = useMemo(() => processedTrades.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage), [processedTrades, currentPage, entriesPerPage]);

  return {
    trades,
    processedTrades,
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
  };
}
