import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchNormalizedFundSummary,
  getFundTransactions,
  getFundPerformance,
  addFund as addFundApi,
  withdrawFund as withdrawFundApi
} from '../api/FundService';
import { getAllTrades } from '../api/tradeService';

/**
 * useFundSummary hook
 * Provides normalized fund summary, transactions, performance and helpers.
 * Options:
 *  - autoRefreshMs: number | false (interval for summary auto refresh)
 *  - initialPeriod: performance period (default '1M')
 *  - pageSize: transactions page size (default 10)
 */
export function useFundSummary(options = {}) {
  const {
    autoRefreshMs = 0,
    initialPeriod = '1M',
    pageSize = 10,
  } = options;

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [transactionFilter, setTransactionFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingPerformance, setLoadingPerformance] = useState(true);
  const [error, setError] = useState(null);

  const refreshIdRef = useRef(null);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const data = await fetchNormalizedFundSummary();
      let enriched = { ...data };
      // If investedAmount missing or zero, attempt to derive from open trades
      if (!enriched.investedAmount || enriched.investedAmount === 0) {
        try {
          const tradesRes = await getAllTrades();
          // Extract array robustly
          let raw = tradesRes?.data?.data || tradesRes?.data || tradesRes?.trades || tradesRes?.results || (Array.isArray(tradesRes) ? tradesRes : []) || [];
          if (!Array.isArray(raw)) raw = [];
          const openExposure = raw.reduce((sum, t) => {
            if (t?.status !== 'OPEN') return sum;
            const qty = Number(t.quantity) || 0;
            const exitQty = Number(t.exitQuantity) || 0;
            const remaining = Math.max(qty - exitQty, 0);
            const entryPrice = Number(t.entryPrice) || 0;
            return sum + remaining * entryPrice;
          }, 0);
          // Fallback: difference between deposits and available + withdrawals if exposure zero
          const diffBased = Math.max(0,(enriched.totalDeposits||0) - (enriched.availableBalance||0) - (enriched.totalWithdrawals||0));
            enriched.investedAmount = openExposure > 0 ? openExposure : diffBased;
        } catch (e) {
          // swallow computation error; leave investedAmount as-is
          // console.debug('Invested amount derivation failed', e);
        }
      }
      setSummary(enriched);
    } catch (e) {
      setError('Failed to load fund summary');
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    try {
      const res = await getFundTransactions(currentPage, pageSize);
      let tx = res?.data?.transactions || res?.transactions || res?.data || [];
      if (!Array.isArray(tx)) tx = [];
      if (transactionFilter !== 'ALL') {
        tx = tx.filter(t => t.type === transactionFilter);
      }
      setTransactions(tx);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTransactions(false);
    }
  }, [currentPage, pageSize, transactionFilter]);

  const loadPerformance = useCallback(async () => {
    setLoadingPerformance(true);
    try {
      const res = await getFundPerformance(selectedPeriod);
      const perf = res?.data || res || [];
      setPerformance(perf);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPerformance(false);
    }
  }, [selectedPeriod]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadSummary(), loadTransactions(), loadPerformance()]);
    setLoading(false);
  }, [loadSummary, loadTransactions, loadPerformance]);

  // initial + dependency loads
  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadTransactions(); }, [loadTransactions]);
  useEffect(() => { loadPerformance(); }, [loadPerformance]);

  // global loading aggregator
  useEffect(() => {
    setLoading(loadingSummary || loadingTransactions || loadingPerformance);
  }, [loadingSummary, loadingTransactions, loadingPerformance]);

  // optional auto refresh for summary only
  useEffect(() => {
    if (!autoRefreshMs || autoRefreshMs <= 0) return;
    refreshIdRef.current = setInterval(() => {
      loadSummary();
    }, autoRefreshMs);
    return () => clearInterval(refreshIdRef.current);
  }, [autoRefreshMs, loadSummary]);

  const addFund = useCallback(async (data) => {
    await addFundApi(data);
    await Promise.all([loadSummary(), loadTransactions()]);
  }, [loadSummary, loadTransactions]);

  const withdrawFund = useCallback(async (data) => {
    await withdrawFundApi(data);
    await Promise.all([loadSummary(), loadTransactions()]);
  }, [loadSummary, loadTransactions]);

  return {
    // data
    summary,
    transactions,
    performance,
    // state
    loading,
    loadingSummary,
    loadingTransactions,
    loadingPerformance,
    error,
    // controls
    selectedPeriod,
    setSelectedPeriod,
    transactionFilter,
    setTransactionFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    // actions
    refreshAll,
    refreshSummary: loadSummary,
    refreshTransactions: loadTransactions,
    refreshPerformance: loadPerformance,
    addFund,
    withdrawFund,
  };
}

export default useFundSummary;
