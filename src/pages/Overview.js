import React, { useEffect, useState, useMemo } from "react";
import { getAllTrades } from '../api/tradeService';
import { getFundSummary } from '../api/FundService';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import StatCard from '../components/overview/StatCard';
import AccountSummaryPanel from '../components/overview/AccountSummaryPanel';
import PerformanceMetricsPanel from '../components/overview/PerformanceMetricsPanel';
import { TrendingUp, Briefcase, Target, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { analyzeTrades } from '../utils/aiInsight';


// --- Helper Functions (move outside component for optimization) ---
const formatK = (value) => {
    if (Math.abs(value) >= 1000) {
        return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
    }
    return value;
};

const exportDataAsCSV = (data, fileName) => {
    if (!data || !data.length) return;
    const keys = Object.keys(data[0]);
    const csvRows = [keys.join(',')];
    data.forEach(row => {
        csvRows.push(keys.map(k => row[k]).join(','));
    });
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    link.click();
};

const printChart = (chartId) => {
    const chartElem = document.getElementById(chartId);
    if (!chartElem) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html lang="en"><head><title>Print Chart</title></head><body>' + chartElem.outerHTML + '</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
};

const GradientDefs = () => (
    <defs>
        <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="lineBlue" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="lineGreen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
    </defs>
);

const CustomTooltip = React.memo(({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200 text-sm">
                <div className="font-semibold text-indigo-700 mb-1">{label}</div>
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span style={{color: p.color}}>
                            {p.dataKey === 'pnl' ? (p.value >= 0 ? '🟢' : '🔴') : '🔵'}
                        </span>
                        <span>{p.name}: <span className="font-bold">₹{p.value.toLocaleString()}</span></span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
});

const Overview = () => {
    const [trades, setTrades] = useState([]);
    const [fundSummary, setFundSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [timeframe, setTimeframe] = useState('30d'); // default 30d view
    const [topSymbolsFilter, setTopSymbolsFilter] = useState('pnl'); // default filter for top symbols
    const { user } = useAuth();

    useEffect(() => {
        fetchData().then(r => r); // Avoid unhandled promise warning);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const tradesRes = await getAllTrades();
            const fundRes = await getFundSummary();
            // Raw responses (dev debug)
            // console.log('getAllTrades raw response:', tradesRes);
            // console.log('getFundSummary raw response:', fundRes);

            // ---- Normalize trades ----
            let rawTrades = [];
            const possible = [
                tradesRes?.data?.data,
                tradesRes?.data,
                tradesRes?.trades,
                tradesRes?.results,
                Array.isArray(tradesRes) ? tradesRes : null
            ];
            for (const candidate of possible) {
                if (Array.isArray(candidate)) { rawTrades = candidate; break; }
            }
            if (!Array.isArray(rawTrades)) rawTrades = [];

            const normalizeTrade = (t) => {
                if (!t || typeof t !== 'object') return null;
                // Map possible alternative keys
                const profit = t.profitOrLoss ?? t.profit_loss ?? t.pnl ?? t.pAndL ?? 0;
                const status = t.status || t.tradeStatus || (t.exitDate ? 'CLOSED' : 'OPEN');
                const type = t.type || t.tradeType || (t.side ? t.side.toUpperCase() : undefined);
                return {
                    ...t,
                    profitOrLoss: Number(profit) || 0,
                    status,
                    type,
                    entryPrice: t.entryPrice ?? t.entry_price ?? t.price ?? 0,
                    stopLoss: t.stopLoss ?? t.stop_loss ?? t.sl ?? undefined,
                    target: t.target ?? t.tp ?? undefined,
                    quantity: t.quantity ?? t.qty ?? 0
                };
            };
            const tradesData = rawTrades.map(normalizeTrade).filter(Boolean);

            // ---- Normalize fund summary ----
            const rawFund = fundRes?.data || fundRes || {};
            const fundData = {
                totalBalance: rawFund.totalBalance ?? rawFund.total_balance ?? rawFund.balance ?? 0,
                realisedProfitPercent: rawFund.realisedProfitPercent ?? rawFund.realised_profit_percent ?? rawFund.realizedProfitPct ?? 0,
                capitalUsage: rawFund.capitalUsage ?? rawFund.capital_usage ?? rawFund.capitalUsedPercent ?? 0,
                // Keep original fields as well
                ...rawFund
            };

            setTrades(tradesData);
            setFundSummary(fundData);
        } catch (err) {
            setError("Failed to fetch overview data: " + (err?.message || err));
        } finally {
            setLoading(false);
        }
    };

    // Timeframe options & filtering placed before metrics to avoid reference errors
    const timeframeOptions = [
        {value:'7d', label:'1W'},
        {value:'30d', label:'1M'},
        {value:'90d', label:'3M'},
        {value:'ytd', label:'YTD'},
        {value:'1y', label:'1Y'},
        {value:'all', label:'ALL'}
    ];

    const filteredTrades = useMemo(() => {
        if (!timeframe || timeframe === 'all') return trades;
        const now = new Date();
        let start;
        const yearStart = new Date(now.getFullYear(),0,1);
        switch(timeframe){
            case '7d': start = new Date(now.getTime() - 7*24*60*60*1000); break;
            case '30d': start = new Date(now.getTime() - 30*24*60*60*1000); break;
            case '90d': start = new Date(now.getTime() - 90*24*60*60*1000); break;
            case '1y': start = new Date(now.getTime() - 365*24*60*60*1000); break;
            case 'ytd': start = yearStart; break;
            default: return trades;
        }
        return trades.filter(t => {
            const dStr = t.exitDate || t.entryDate;
            if(!dStr) return false;
            const d = new Date(dStr);
            return d >= start;
        });
    }, [trades, timeframe]);

    // Compute metrics from trades
    const metrics = useMemo(() => {
        const source = filteredTrades; // use filtered trades
        if (!Array.isArray(source) || source.length === 0) {
            return {
                openTrades: 0,
                totalExposure: 0,
                winRate: 0,
                closedTrades: 0,
                totalPL: 0,
                bestTrade: 0,
                worstTrade: 0,
                consecutiveWins: 0,
                consecutiveLosses: 0,
                avgTimeInTrade: 0,
                longPerformance: 0,
                shortPerformance: 0,
                profitFactor: 0,
                riskReward: 0,
                avgWinningTrade: 0,
                avgLosingTrade: 0,
                winCount: 0,
                lossCount: 0,
                avgWinningHoldingDays: 0,
                avgWinningDayPL: 0,
                avgLosingDayPL: 0,
                largestProfitableDay: 0,
                largestLosingDay: 0,
                totalCharges: 0,
                totalBrokerage: 0,
            };
        }
        let openTrades = 0;
        let totalExposure = 0;
        let winCount = 0;
        let lossCount = 0;
        let closedTrades = 0;
        let totalPL = 0;
        let bestTrade = -Infinity;
        let worstTrade = Infinity;
        let consecutiveWins = 0, maxConsecWins = 0;
        let consecutiveLosses = 0, maxConsecLosses = 0;
        let totalTime = 0, timeCount = 0;
        let longPerformance = 0;
        let shortPerformance = 0;
        let totalProfit = 0, totalLoss = 0;
        let totalRisk = 0, totalReward = 0;
        let lastResult = null;
        let totalWinningDuration = 0, winningDurationCount = 0;
        let totalCharges = 0, totalBrokerage = 0;
        // Day aggregation
        const dayMap = {}; // date -> aggregated pnl

        source.forEach(trade => {
            const isOpen = trade.status === 'OPEN';
            if (isOpen) openTrades++;
            if (trade.entryPrice && trade.quantity) {
                totalExposure += trade.entryPrice * trade.quantity;
            }
            if (trade.status === 'CLOSED') {
                closedTrades++;
                const pnl = Number(trade.profitOrLoss) || 0;
                totalPL += pnl;
                if (pnl > 0) {
                    winCount++;
                    totalProfit += pnl;
                    consecutiveWins = lastResult === 'WIN' ? consecutiveWins + 1 : 1;
                    maxConsecWins = Math.max(maxConsecWins, consecutiveWins);
                    consecutiveLosses = 0;
                    lastResult = 'WIN';
                } else if (pnl < 0) {
                    lossCount++;
                    totalLoss += Math.abs(pnl);
                    consecutiveLosses = lastResult === 'LOSS' ? consecutiveLosses + 1 : 1;
                    maxConsecLosses = Math.max(maxConsecLosses, consecutiveLosses);
                    consecutiveWins = 0;
                    lastResult = 'LOSS';
                } else {
                    consecutiveWins = 0;
                    consecutiveLosses = 0;
                    lastResult = null;
                }
                bestTrade = Math.max(bestTrade, pnl);
                worstTrade = Math.min(worstTrade, pnl);
                if (trade.entryDate && trade.exitDate) {
                    const entry = new Date(trade.entryDate);
                    const exit = new Date(trade.exitDate);
                    const diffDays = (exit - entry) / (1000 * 60 * 60 * 24);
                    totalTime += diffDays;
                    timeCount++;
                    if (pnl > 0) {
                        totalWinningDuration += diffDays;
                        winningDurationCount++;
                    }
                }
                if (trade.type === 'BUY') longPerformance += pnl;
                if (trade.type === 'SELL') shortPerformance += pnl;
                if (trade.stopLoss && trade.entryPrice) {
                    totalRisk += Math.abs(trade.entryPrice - trade.stopLoss);
                }
                if (trade.target && trade.entryPrice) {
                    totalReward += Math.abs(trade.target - trade.entryPrice);
                }
                if (trade.exitDate) {
                    const day = new Date(trade.exitDate).toISOString().slice(0,10);
                    if (!dayMap[day]) dayMap[day] = 0;
                    dayMap[day] += pnl;
                }
                totalCharges += Number(trade.totalCharges) || 0;
                totalBrokerage += Number(trade.brokerage) || 0;
            }
        });
        const winRate = closedTrades > 0 ? (winCount / closedTrades) * 100 : 0;
        const avgTimeInTrade = timeCount > 0 ? totalTime / timeCount : 0;
        const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
        const riskReward = totalRisk > 0 ? totalReward / totalRisk : 0;
        const avgWinningTrade = winCount > 0 ? totalProfit / winCount : 0;
        const avgLosingTrade = lossCount > 0 ? -(totalLoss / lossCount) : 0; // negative value
        const avgWinningHoldingDays = winningDurationCount > 0 ? totalWinningDuration / winningDurationCount : 0;
        // Day stats
        let largestProfitableDay = 0, largestLosingDay = 0, winningDaySum = 0, winningDayCount = 0, losingDaySum = 0, losingDayCount = 0;
        Object.values(dayMap).forEach(p => {
            if (p > 0) {
                largestProfitableDay = Math.max(largestProfitableDay, p);
                winningDaySum += p;
                winningDayCount++;
            } else if (p < 0) {
                largestLosingDay = Math.min(largestLosingDay, p); // most negative
                losingDaySum += p;
                losingDayCount++;
            }
        });
        const avgWinningDayPL = winningDayCount > 0 ? winningDaySum / winningDayCount : 0;
        const avgLosingDayPL = losingDayCount > 0 ? losingDaySum / losingDayCount : 0;

        return {
            openTrades,
            totalExposure,
            winRate,
            closedTrades,
            totalPL,
            bestTrade: Number.isFinite(bestTrade) ? bestTrade : 0,
            worstTrade: Number.isFinite(worstTrade) ? worstTrade : 0,
            consecutiveWins: maxConsecWins,
            consecutiveLosses: maxConsecLosses,
            avgTimeInTrade,
            longPerformance,
            shortPerformance,
            profitFactor,
            riskReward,
            avgWinningTrade,
            avgLosingTrade,
            winCount,
            lossCount,
            avgWinningHoldingDays,
            avgWinningDayPL,
            avgLosingDayPL,
            largestProfitableDay,
            largestLosingDay, // negative number
            totalCharges,
            totalBrokerage,
        };
    }, [filteredTrades]);

    // Chart Data Preparation (optimized)
    const chartData = useMemo(() => {
        const source = filteredTrades;
        const exposureTrend = [];
        let winCount = 0, lossCount = 0, breakevenCount = 0;
        let longCount = 0, shortCount = 0;
        const symbolMap = {};
        const symbolCountMap = {};
        const dayMap = {};
        source.forEach(trade => {
            if (trade.exitDate && trade.status === 'CLOSED') {
                const day = new Date(trade.exitDate).toISOString().slice(0, 10);
                const pnl = trade.profitOrLoss || 0;
                if (!dayMap[day]) dayMap[day] = { pnl: 0, count: 0 };
                dayMap[day].pnl += pnl;
                dayMap[day].count++;
            }
            if (trade.entryDate) {
                const day = new Date(trade.entryDate).toISOString().slice(0, 10);
                const exposure = (trade.entryPrice || 0) * (trade.quantity || 0);
                exposureTrend.push({ date: day, exposure });
            }
            if (trade.status === 'CLOSED') {
                const pnl = trade.profitOrLoss || 0;
                if (pnl > 0) winCount++;
                else if (pnl < 0) lossCount++;
                else breakevenCount++;
            }
            if (trade.type === 'BUY') longCount++;
            if (trade.type === 'SELL') shortCount++;
            if (trade.symbol) {
                if (!symbolMap[trade.symbol]) symbolMap[trade.symbol] = 0;
                symbolMap[trade.symbol] += trade.profitOrLoss || 0;
                if (!symbolCountMap[trade.symbol]) symbolCountMap[trade.symbol] = 0;
                symbolCountMap[trade.symbol]++;
            }
        });
        const pnlTrendArr = Object.entries(dayMap).map(([date, obj]) => ({ date, pnl: obj.pnl }));
        pnlTrendArr.sort((a, b) => a.date.localeCompare(b.date));
        const exposureAgg = {};
        exposureTrend.forEach(({ date, exposure }) => {
            if (!exposureAgg[date]) exposureAgg[date] = 0;
            exposureAgg[date] += exposure;
        });
        const exposureTrendArr = Object.entries(exposureAgg).map(([date, exposure]) => ({ date, exposure }));
        exposureTrendArr.sort((a, b) => a.date.localeCompare(b.date));
        const winLossPie = [
            { name: 'Wins', value: winCount },
            { name: 'Losses', value: lossCount },
            { name: 'Breakeven', value: breakevenCount }
        ];
        const tradeTypePie = [
            { name: 'Long', value: longCount },
            { name: 'Short', value: shortCount }
        ];
        // Top symbols with count
        const topSymbolsArr = Object.entries(symbolMap)
            .map(([symbol, pnl]) => ({ symbol, pnl, count: symbolCountMap[symbol] }))
            .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
            .slice(0, 5);
        const bestDay = pnlTrendArr.length > 0 ? pnlTrendArr.reduce((a, b) => a.pnl > b.pnl ? a : b) : null;
        const worstDay = pnlTrendArr.length > 0 ? pnlTrendArr.reduce((a, b) => a.pnl < b.pnl ? a : b) : null;
        return {
            pnlTrend: pnlTrendArr,
            exposureTrend: exposureTrendArr,
            winLossPie,
            tradeTypePie,
            topSymbolsArr,
            bestDay,
            worstDay
        };
    }, [filteredTrades]);

    // Filtered Top Symbols (optimized)
    const filteredTopSymbolsArr = useMemo(() => {
        if (!chartData.topSymbolsArr) return [];
        switch (topSymbolsFilter) {
            case 'pnl':
                return chartData.topSymbolsArr.slice().sort((a, b) => b.pnl - a.pnl);
            case 'loss':
                return chartData.topSymbolsArr.filter(s => s.pnl < 0).sort((a, b) => a.pnl - b.pnl);
            case 'count':
                return chartData.topSymbolsArr.slice().sort((a, b) => b.count - a.count);
            default:
                return chartData.topSymbolsArr;
        }
    }, [chartData.topSymbolsArr, topSymbolsFilter]);

    // --- Enhanced Overview Insights ---
    const insight = useMemo(() => analyzeTrades(trades), [trades]);

    if (loading) {
        return (
          <div className="p-4 md:p-6 space-y-6" aria-busy="true" aria-live="polite">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
              <div className="flex flex-wrap items-center gap-2">
                {['7d','30d','90d','ytd','1y','all'].map(v=> <button key={v} disabled className="px-3 py-1.5 text-xs rounded-full border bg-gray-100 text-gray-400 cursor-wait">{v.toUpperCase()}</button>)}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Open Trades" loading />
              <StatCard label="Total Exposure" loading />
              <StatCard label="Win Rate" loading />
              <StatCard label="Total P&L" loading />
            </div>
            <AccountSummaryPanel loading />
            <PerformanceMetricsPanel loading />
          </div>
        );
    }
    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    // Defensive fallback for tradeTypeStats
    const tradeTypeStats = insight.tradeTypeStats || { long: { count: 0, pnl: 0 }, short: { count: 0, pnl: 0 } };

    return (
        <div className="p-4 md:p-6 space-y-6 dark:bg-gray-950">
            {/* Welcome Header & Quick Actions */}
            <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.7}} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-indigo-700 dark:text-indigo-300">Welcome back, {user?.username || 'Trader'}!</h1>
                    <p className="text-gray-500 dark:text-gray-400">Your personalized trading analytics dashboard</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition" onClick={()=>exportDataAsCSV(filteredTrades, 'all_trades.csv')}>Export All Data (CSV)</button>
                </div>
            </motion.div>
            {/* Timeframe Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {timeframeOptions.map(opt => (
                    <button key={opt.value} onClick={()=>setTimeframe(opt.value)} className={`px-3 py-1.5 text-xs rounded-full border transition ${timeframe===opt.value? 'bg-indigo-600 text-white border-indigo-600 shadow':'bg-white dark:bg-gray-900 hover:bg-gray-50 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>{opt.label}</button>
                ))}
            </div>
            {/* Onboarding/Empty State */}
            {filteredTrades.length === 0 && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.7}} className="flex flex-col items-center justify-center py-12">
                    <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">No trades yet!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Start by adding your first trade to see analytics and insights.</p>
                    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition" onClick={()=>window.location.href='/trade-log'}>Add Trade</button>
                </motion.div>
            )}
            {/* Top Stat Cards with animation */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7}} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Briefcase} label="Open Trades" value={metrics.openTrades} subtitle="Active positions" />
                <StatCard icon={Target} label="Total Exposure" value={`₹${metrics.totalExposure.toLocaleString(undefined,{minimumFractionDigits:2})}`} subtitle="Capital at risk" />
                <StatCard icon={Trophy} label="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} subtitle={`${metrics.closedTrades} closed trades`} />
                <StatCard icon={TrendingUp} label="Total P&L" value={`${metrics.totalPL>=0?'+':''}₹${metrics.totalPL.toLocaleString(undefined,{minimumFractionDigits:2})}`} valueClassName={metrics.totalPL>=0?'text-green-600':'text-red-600'} subtitle="Closed trades P&L" />
            </motion.div>
            {/* Account Summary & Performance Metrics Panels (animated) */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.7}}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AccountSummaryPanel loading={loading} fundSummary={fundSummary} className="w-full min-w-0" />
                    <PerformanceMetricsPanel loading={loading} metrics={metrics} className="w-full min-w-0" />
                </div>
            </motion.div>
            {/* Analytics Charts Section */}
            <div className="space-y-8">
                {/* Main Performance Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* P&L Trend Chart */}
                    <div className="bg-gradient-to-br from-white via-indigo-50 to-white dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 p-8 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-900 relative">
                        <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">P&L Trend</h3>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs" onClick={()=>printChart('pnlTrendChart')}>Print</button>
                            <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs" onClick={()=>exportDataAsCSV(chartData.pnlTrend,'pnl_trend.csv')}>Export CSV</button>
                        </div>
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart id="pnlTrendChart" data={chartData.pnlTrend} margin={{top:20,right:30,left:0,bottom:10}} isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out">
                                <GradientDefs />
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                <XAxis dataKey="date" tick={{fontSize: 15, fill: '#6366f1'}} />
                                <YAxis tick={{fontSize: 15, fill: '#6366f1'}} tickFormatter={formatK} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="pnl" stroke="url(#lineGreen)" strokeWidth={3} dot={{r:5,stroke:'#22c55e',strokeWidth:2,fill:'#fff'}} activeDot={{r:7,fill:'#22c55e'}} isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out" />
                            </LineChart>
                        </ResponsiveContainer>
                        {chartData.bestDay && (
                            <p className="text-sm mt-2 text-green-600">Best Day: {chartData.bestDay.date} (+₹{chartData.bestDay.pnl.toLocaleString(undefined, {minimumFractionDigits:2})})</p>
                        )}
                        {chartData.worstDay && (
                            <p className="text-sm mt-1 text-red-600">Worst Day: {chartData.worstDay.date} (₹{chartData.worstDay.pnl.toLocaleString(undefined, {minimumFractionDigits:2})})</p>
                        )}
                    </div>
                    {/* Exposure Over Time Chart */}
                    <div className="bg-gradient-to-br from-white via-blue-50 to-white dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-8 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900 relative">
                        <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">Exposure Over Time</h3>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs" onClick={()=>printChart('exposureChart')}>Print</button>
                            <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs" onClick={()=>exportDataAsCSV(chartData.exposureTrend,'exposure.csv')}>Export CSV</button>
                        </div>
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart id="exposureChart" data={chartData.exposureTrend} margin={{top:20,right:30,left:0,bottom:10}} isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out">
                                <GradientDefs />
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                <XAxis dataKey="date" tick={{fontSize: 15, fill: '#6366f1'}} />
                                <YAxis tick={{fontSize: 15, fill: '#6366f1'}} tickFormatter={formatK} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="exposure" stroke="url(#lineBlue)" strokeWidth={3} dot={{r:5,stroke:'#6366f1',strokeWidth:2,fill:'#fff'}} activeDot={{r:7,fill:'#6366f1'}} isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Distribution Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Win/Loss Distribution Pie */}
                    <div className="bg-gradient-to-br from-white via-green-50 to-white dark:from-gray-900 dark:via-green-950 dark:to-gray-900 p-8 rounded-2xl shadow-xl border border-green-100 dark:border-green-900 relative">
                        <h3 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300">Win/Loss Distribution</h3>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs" onClick={()=>printChart('winLossChart')}>Print</button>
                            <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs" onClick={()=>exportDataAsCSV(chartData.winLossPie,'winloss.csv')}>Export CSV</button>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart id="winLossChart" isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out">
                                <GradientDefs />
                                <Pie
                                    data={chartData.winLossPie}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({name, value}) => `${name}: ${value}`}
                                    labelLine={false}
                                    isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out"
                                >
                                    <Cell key="Wins" fill="url(#barGreen)" />
                                    <Cell key="Losses" fill="url(#barRed)" />
                                    <Cell key="Breakeven" fill="#eab308" />
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" wrapperStyle={{fontSize:'15px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Trade Type Breakdown Pie */}
                    <div className="bg-gradient-to-br from-white via-purple-50 to-white dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 p-8 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900 relative">
                        <h3 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-300">Trade Type Breakdown</h3>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs" onClick={()=>printChart('tradeTypeChart')}>Print</button>
                            <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs" onClick={()=>exportDataAsCSV(chartData.tradeTypePie,'tradetype.csv')}>Export CSV</button>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart id="tradeTypeChart" isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out">
                                <GradientDefs />
                                <Pie
                                    data={chartData.tradeTypePie}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({name, value}) => `${name}: ${value}`}
                                    labelLine={false}
                                    isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out"
                                >
                                    <Cell key="Long" fill="#6366f1" />
                                    <Cell key="Short" fill="#f59e0b" />
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" wrapperStyle={{fontSize:'15px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Top Symbols Chart - Full width */}
                {/* --- Top Symbols by P&L Section --- */}
                <div className="bg-gradient-to-br from-white via-green-50 to-white dark:from-gray-900 dark:via-green-950 dark:to-gray-900 p-8 rounded-2xl shadow-xl border border-green-100 dark:border-green-900 relative flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-green-700 dark:text-green-300">Top Symbols by P&L</h3>
                            {filteredTopSymbolsArr.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {filteredTopSymbolsArr.map((sym, idx) => (
                                        <span key={sym.symbol} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${sym.pnl >= 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'} mr-2`}>
                                            {sym.symbol}
                                            <span className="ml-2 px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs">{sym.count} trades</span>
                                            <span className="ml-2 font-bold">₹{sym.pnl.toLocaleString()}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <span className="text-sm text-gray-500 dark:text-gray-400 block mt-2">Your most traded symbols and their performance.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <select className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200" aria-label="Filter Top Symbols" onChange={e => setTopSymbolsFilter(e.target.value)} value={topSymbolsFilter}>
                                <option value="pnl">Top by Profit</option>
                                <option value="loss">Top by Loss</option>
                                <option value="count">Most Traded</option>
                            </select>
                            <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs" onClick={()=>printChart('topSymbolsChart')}>Print</button>
                            <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs" onClick={()=>exportDataAsCSV(filteredTopSymbolsArr,'topsymbols.csv')}>Export CSV</button>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-2">
                        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>Profit</span>
                        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>Loss</span>
                    </div>
                    {/* Chart or Empty State */}
                    {filteredTopSymbolsArr.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">No symbol data available. Add trades to see your top symbols.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart
                                id="topSymbolsChart"
                                data={filteredTopSymbolsArr}
                                barCategoryGap={32}
                                barGap={8}
                                margin={{top:20,right:30,left:0,bottom:10}}
                                isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out"
                                aria-label="Top Symbols by Profit and Loss"
                            >
                                <GradientDefs />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                                <XAxis dataKey="symbol" tick={{fontSize: 15, fill: '#22c55e'}} />
                                <YAxis tick={{fontSize: 15, fill: '#22c55e'}} tickFormatter={formatK} axisLine={false} />
                                <Tooltip content={({active, payload}) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className={`rounded-lg shadow-lg px-4 py-2 border text-sm ${d.pnl >= 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                                <div className="font-semibold">{d.symbol}</div>
                                                <div>Trades: <span className="font-bold">{d.count}</span></div>
                                                <div>P&L: <span className="font-bold">₹{d.pnl.toLocaleString()}</span></div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                                <Bar dataKey="pnl" barSize={28} radius={[12, 12, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out">
                                    {filteredTopSymbolsArr.map((d) => (
                                        <Cell key={d.symbol} fill={d.pnl >= 0 ? 'url(#barGreen)' : 'url(#barRed)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
            {/* --- Enhanced Overview Insights --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Best/Worst Day/Week/Month */}
                <div className="bg-white rounded-lg border p-5 space-y-3">
                    <h3 className="font-semibold text-gray-800">Best & Worst Periods</h3>
                    <div className="text-sm space-y-1">
                        {insight.bestDay && <p>Best Day: <span className="font-bold text-green-700">{insight.bestDay.date}</span> ₹{insight.bestDay.pnl.toFixed(2)}</p>}
                        {insight.worstDay && <p>Worst Day: <span className="font-bold text-red-700">{insight.worstDay.date}</span> ₹{insight.worstDay.pnl.toFixed(2)}</p>}
                        {insight.bestWeek && <p>Best Week: <span className="font-bold text-green-700">{insight.bestWeek.week}</span> ₹{insight.bestWeek.pnl.toFixed(2)}</p>}
                        {insight.worstWeek && <p>Worst Week: <span className="font-bold text-red-700">{insight.worstWeek.week}</span> ₹{insight.worstWeek.pnl.toFixed(2)}</p>}
                        {insight.bestMonth && <p>Best Month: <span className="font-bold text-green-700">{insight.bestMonth.month}</span> ₹{insight.bestMonth.pnl.toFixed(2)}</p>}
                        {insight.worstMonth && <p>Worst Month: <span className="font-bold text-red-700">{insight.worstMonth.month}</span> ₹{insight.worstMonth.pnl.toFixed(2)}</p>}
                    </div>
                </div>
                {/* Most Traded Symbol & Streaks */}
                <div className="bg-white rounded-lg border p-5 space-y-3">
                    <h3 className="font-semibold text-gray-800">Symbol & Streaks</h3>
                    <div className="text-sm space-y-1">
                        {insight.mostTradedSymbol && <p>Most Traded: <span className="font-bold text-blue-700">{insight.mostTradedSymbol[0]}</span> ({insight.mostTradedSymbol[1]} trades)</p>}
                        <p>Max Win Streak: <span className="font-bold text-green-700">{insight.winStreak}</span></p>
                        <p>Max Loss Streak: <span className="font-bold text-red-700">{insight.lossStreak}</span></p>
                    </div>
                </div>
            </div>
            {/* Recent Trades */}
            <div className="bg-white rounded-lg border p-5 space-y-3">
                <h3 className="font-semibold text-gray-800">Recent Trades</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                    {(insight.recentTrades && Array.isArray(insight.recentTrades) ? insight.recentTrades : []).map((t,i)=>(
                        <div key={i} className={`rounded p-2 border text-xs ${t.result==='Win'?'bg-green-50 border-green-200 text-green-700':t.result==='Loss'?'bg-red-50 border-red-200 text-red-700':'bg-gray-50 border-gray-200 text-gray-700'}`}>
                            <div className="font-semibold">{t.symbol}</div>
                            <div>{t.date}</div>
                            <div>{t.result}: <span className="font-bold">₹{t.pnl.toFixed(2)}</span></div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Trade Type Breakdown & Charges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border p-5 space-y-3">
                    <h3 className="font-semibold text-gray-800">Trade Type Breakdown</h3>
                    <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1">Long: {tradeTypeStats.long.count} trades, ₹{tradeTypeStats.long.pnl.toFixed(2)}</span>
                        <span className="flex items-center gap-1">Short: {tradeTypeStats.short.count} trades, ₹{tradeTypeStats.short.pnl.toFixed(2)}</span>
                    </div>
                </div>
                <div className="bg-white rounded-lg border p-5 space-y-3">
                    <h3 className="font-semibold text-gray-800">Charges & Brokerage</h3>
                    <div className="text-sm space-y-1">
                        <p>Total Charges: <span className="font-bold">₹{insight.chargesSummary.totalCharges.toFixed(2)}</span></p>
                        <p>Avg Charges/Trade: <span className="font-bold">₹{insight.chargesSummary.avgCharges.toFixed(2)}</span></p>
                        <p>Total Brokerage: <span className="font-bold">₹{insight.chargesSummary.totalBrokerage.toFixed(2)}</span></p>
                        <p>Avg Brokerage/Trade: <span className="font-bold">₹{insight.chargesSummary.avgBrokerage.toFixed(2)}</span></p>
                    </div>
                </div>
            </div>
            {/* Win/Loss Pie & Symbol Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border p-5 space-y-3">
                    <h3 className="font-semibold text-gray-800">Win/Loss Distribution</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={insight.winLossPie}>
                            <Tooltip formatter={(val, name)=>[val, name]} />
                            <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={true} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-lg border p-5 space-y-3">
                    <h3 className="font-semibold text-gray-800">Symbol Distribution</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={insight.symbolPie}>
                            <Tooltip formatter={(val, name)=>[val, name]} />
                            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={true} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {/* Calendar Heatmap */}
            <div className="bg-white rounded-lg border p-5 space-y-3">
                <h3 className="font-semibold text-gray-800">Trade Calendar Heatmap</h3>
                <div className="grid grid-cols-7 gap-1 text-[10px]">
                    {Object.entries(insight.calendarHeatmap).map(([date, count]) => (
                        <div key={date} className={`rounded p-1 flex flex-col items-center ${count>=6?'bg-red-100 text-red-700':count>=3?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`} title={`${date}: ${count} trades`}>
                            <span>{date.slice(5)}</span>
                            <span className="font-medium">{count}</span>
                        </div>
                    ))}
                </div>
                <p className="text-[11px] text-gray-500">Color indicates trade frequency per day.</p>
            </div>
        </div>
    );
};

export default Overview;
