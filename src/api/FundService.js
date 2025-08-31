import axiosInstance from '../utils/axiosInstance';

// Base path constant (parity with tradeService style)
const FUND_API_BASE = '/funds';

// Raw requests (return full axios promise)
export const getFundSummaryRaw = () => axiosInstance.get(`${FUND_API_BASE}/summary`);
export const getFundTransactionsRaw = (page = 1, limit = 10) => axiosInstance.get(`${FUND_API_BASE}/transactions`, { params: { page, limit } });
export const addFundRaw = (fundData) => axiosInstance.post(`${FUND_API_BASE}/deposit`, fundData);
export const withdrawFundRaw = (withdrawData) => axiosInstance.post(`${FUND_API_BASE}/withdraw`, withdrawData);
export const getFundPerformanceRaw = (period = '1M') => axiosInstance.get(`${FUND_API_BASE}/performance`, { params: { period } });
export const getFundHistoryRaw = (startDate, endDate) => axiosInstance.get(`${FUND_API_BASE}/date-range`, { params: { startDate, endDate } });

// Convenience unwrapped (mirrors prior return shape = .data)
const unwrap = (p) => p.then(res => res.data);

export const getFundSummary = () => unwrap(getFundSummaryRaw());
export const getFundTransactions = (page = 1, limit = 10) => unwrap(getFundTransactionsRaw(page, limit));
export const addFund = (fundData) => unwrap(addFundRaw(fundData));
export const withdrawFund = (withdrawData) => unwrap(withdrawFundRaw(withdrawData));
export const getFundPerformance = (period = '1M') => unwrap(getFundPerformanceRaw(period));
export const getFundHistory = (startDate, endDate) => unwrap(getFundHistoryRaw(startDate, endDate));

// Normalizer to produce a canonical fund summary object for UI
export const normalizeFundSummary = (summaryResponse) => {
  const raw = summaryResponse?.data || summaryResponse || {};
  return {
    totalBalance: raw.totalBalance ?? raw.currentBalance ?? 0,
    availableBalance: raw.availableBalance ?? raw.currentBalance ?? raw.totalBalance ?? 0,
    investedAmount: raw.investedAmount ?? 0,
    totalDeposits: raw.totalDeposits ?? 0,
    totalWithdrawals: raw.totalWithdrawals ?? 0,
    totalPnL: raw.totalPnL ?? (raw.totalDeposits !== undefined && raw.totalWithdrawals !== undefined ? (raw.totalDeposits - raw.totalWithdrawals) : 0),
    dayPnL: raw.dayPnL ?? 0,
    monthlyDeposits: raw.monthlyDeposits ?? 0,
    monthlyWithdrawals: raw.monthlyWithdrawals ?? 0,
    lastTransactionDate: raw.lastTransactionDate ?? null,
    transactionCount: raw.transactionCount ?? 0
  };
};

// Optional combined helper: fetch + normalize
export const fetchNormalizedFundSummary = async () => normalizeFundSummary(await getFundSummary());
