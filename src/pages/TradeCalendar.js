import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getTradeByRange } from '../api/tradeService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, Circle, BarChart3 } from 'lucide-react';
import TradeDetailsModal from '../components/modals/TradeDetailsModal';

const TradeCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [trades, setTrades] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewMode, setViewMode] = useState('profit'); // 'profit', 'volume', 'count'
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch trades for the current month
    const fetchTrades = useCallback(async () => {
        setLoading(true);
        try {
            const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
            
            const response = await getTradeByRange(startDate, endDate);
            const tradesData = Array.isArray(response.data) ? response.data : 
                              Array.isArray(response.data.data) ? response.data.data : [];
            setTrades(tradesData);
        } catch (error) {
            // ToastNotification.error("Failed to fetch trades");
            console.error('Error fetching trades:', error);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchTrades();
    }, [fetchTrades]);

    // Process trades by date
    const tradesByDate = useMemo(() => {
        const dateMap = new Map();
        
        if (!Array.isArray(trades)) {
            return dateMap;
        }
        
        trades.forEach(trade => {
            if (!trade?.entryDate) return;
            
            try {
                const entryDate = format(parseISO(trade.entryDate), 'yyyy-MM-dd');
                if (!dateMap.has(entryDate)) {
                    dateMap.set(entryDate, {
                        trades: [],
                        totalProfit: 0,
                        totalVolume: 0,
                        winCount: 0,
                        lossCount: 0,
                        openCount: 0
                    });
                }
                
                const dayData = dateMap.get(entryDate);
                dayData.trades.push(trade);
                
                // Calculate metrics
                const pnl = trade.profitOrLoss || 0;
                const volume = (trade.entryPrice || 0) * (trade.quantity || 0);
                
                dayData.totalProfit += pnl;
                dayData.totalVolume += volume;
                
                if (trade.status === 'CLOSED') {
                    if (pnl > 0) dayData.winCount++;
                    else if (pnl < 0) dayData.lossCount++;
                } else {
                    dayData.openCount++;
                }
            } catch (error) {
                console.error('Error parsing trade date:', trade.entryDate, error);
            }
        });
        
        return dateMap;
    }, [trades]);

    // Calculate monthly summary statistics
    const monthlySummary = useMemo(() => {
        const summary = {
            winningTrades: 0,
            losingTrades: 0,
            openTrades: 0,
            breakevenTrades: 0,
            totalTrades: Array.isArray(trades) ? trades.length : 0,
            netPnL: 0,
            winRate: 0,
            bestDay: { date: null, amount: 0 },
            worstDay: { date: null, amount: 0 },
            profitFactor: 0
        };

        if (!Array.isArray(trades)) {
            return summary;
        }

        trades.forEach(trade => {
            const pnl = trade?.profitOrLoss || 0;
            summary.netPnL += pnl;
            
            if (trade?.status === 'OPEN') {
                summary.openTrades++;
            } else if (trade?.status === 'CLOSED') {
                if (pnl > 0) {
                    summary.winningTrades++;
                } else if (pnl < 0) {
                    summary.losingTrades++;
                } else {
                    summary.breakevenTrades++;
                }
            }
        });

        // Calculate derived metrics
        const closedTrades = trades.filter(t => t?.status === 'CLOSED');
        const totalWinRate = closedTrades.length > 0 ? (summary.winningTrades / closedTrades.length) * 100 : 0;
        summary.winRate = parseFloat(totalWinRate.toFixed(1));
        
        if (tradesByDate && tradesByDate.size > 0) {
            const dayDataArray = Array.from(tradesByDate.values());
            
            const bestDayTrade = dayDataArray.reduce((prev, curr) => 
                curr.totalProfit > prev.totalProfit ? curr : prev, { totalProfit: 0, trades: [] });
            summary.bestDay = {
                date: bestDayTrade.trades?.length > 0 && bestDayTrade.trades[0]?.entryDate ? 
                      format(parseISO(bestDayTrade.trades[0].entryDate), 'MMMM d') : null,
                amount: bestDayTrade.totalProfit
            };
            
            const worstDayTrade = dayDataArray.reduce((prev, curr) => 
                curr.totalProfit < prev.totalProfit ? curr : prev, { totalProfit: 0, trades: [] });
            summary.worstDay = {
                date: worstDayTrade.trades?.length > 0 && worstDayTrade.trades[0]?.entryDate ? 
                      format(parseISO(worstDayTrade.trades[0].entryDate), 'MMMM d') : null,
                amount: worstDayTrade.totalProfit
            };
        }
        
        const totalProfit = closedTrades.filter(t => (t?.profitOrLoss || 0) > 0).reduce((sum, t) => sum + (t?.profitOrLoss || 0), 0);
        const totalLoss = closedTrades.filter(t => (t?.profitOrLoss || 0) < 0).reduce((sum, t) => sum + Math.abs(t?.profitOrLoss || 0), 0);
        summary.profitFactor = totalLoss > 0 ? parseFloat((totalProfit / totalLoss).toFixed(2)) : 0;

        return summary;
    }, [trades, tradesByDate]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    // Navigation functions
    const goToPreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
    const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Get day cell styling based on trade data
    const getDayCellStyle = (day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayData = tradesByDate.get(dateKey);
        
        if (!dayData || dayData.trades.length === 0) {
            return 'bg-gray-50 hover:bg-gray-100';
        }

        switch (viewMode) {
            case 'profit':
                if (dayData.totalProfit > 0) return 'bg-green-100 hover:bg-green-200 border-green-300';
                if (dayData.totalProfit < 0) return 'bg-red-100 hover:bg-red-200 border-red-300';
                return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300';
            case 'volume':
                const intensity = Math.min(dayData.totalVolume / 100000, 1);
                return `bg-purple-${Math.round(intensity * 500) + 100} hover:bg-blue-300`;
            case 'count':
                const count = dayData.trades.length;
                if (count >= 5) return 'bg-purple-200 hover:bg-purple-300 border-purple-400';
                if (count >= 3) return 'bg-purple-100 hover:bg-purple-200 border-purple-300';
                return 'bg-purple-50 hover:bg-purple-100 border-purple-200';
            default:
                return 'bg-gray-50 hover:bg-gray-100';
        }
    };


    // Handle day click
    const handleDayClick = (day) => {
        setSelectedDate(day);
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayData = tradesByDate.get(dateKey);
        if (dayData && dayData.trades.length === 1) {
            setSelectedTrade(dayData.trades[0]);
            setShowDetailsModal(true);
        }
    };

    // Get selected date trades
    const selectedDateTrades = selectedDate ? 
        tradesByDate.get(format(selectedDate, 'yyyy-MM-dd'))?.trades || [] : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-full mx-auto min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div className="flex items-center gap-4 mb-4 lg:mb-0">
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Today
                        </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* View Mode Selector */}
                        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                            <button
                                onClick={() => setViewMode('profit')}
                                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
                                    viewMode === 'profit' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <TrendingUp className="h-4 w-4" />
                                P&L View
                            </button>
                            <button
                                onClick={() => setViewMode('volume')}
                                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
                                    viewMode === 'volume' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <BarChart3 className="h-4 w-4" />
                                Volume View
                            </button>
                            <button
                                onClick={() => setViewMode('count')}
                                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
                                    viewMode === 'count' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Circle className="h-4 w-4" />
                                Count View
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-medium text-green-700">{trades.filter(t => t.profitOrLoss > 0).length} Wins</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="font-medium text-red-700">{trades.filter(t => t.profitOrLoss < 0).length} Losses</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Legend */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Winning Trades</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span>Losing Trades</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span>Open Trades</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <span>Breakeven</span>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            Click on any day to view trade details • {trades.length} trades this month
                        </div>
                    </div>
                </div>

                {/* Enhanced Trading Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
                    {/* Total Trades */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {monthlySummary.totalTrades}
                        </div>
                        <div className="text-xs text-gray-600">Total Trades</div>
                        <div className="text-xs text-blue-500 mt-1">
                            {Math.max(1, new Set(trades.filter(t => t.entryDate).map(t => format(parseISO(t.entryDate), 'yyyy-MM-dd'))).size)} trading days
                        </div>
                    </div>

                    {/* Net P&L */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                        <div className={`text-2xl font-bold mb-1 flex items-center justify-center ${
                            monthlySummary.netPnL >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {monthlySummary.netPnL >= 0 ? '+' : ''}₹{Math.abs(monthlySummary.netPnL).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Net P&L</div>
                        <div className={`text-xs mt-1 ${
                            monthlySummary.netPnL >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                            {monthlySummary.netPnL >= 0 ? 'Profit' : 'Loss'}
                        </div>
                    </div>

                    {/* Win Rate */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {monthlySummary.winRate}%
                        </div>
                        <div className="text-xs text-gray-600">Win Rate</div>
                        <div className="text-xs text-purple-500 mt-1">Success rate</div>
                    </div>

                    {/* Best Day */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            ₹{monthlySummary.bestDay.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Best Day</div>
                        <div className="text-xs text-green-500 mt-1">
                            {monthlySummary.bestDay.date || 'N/A'}
                        </div>
                    </div>

                    {/* Worst Day */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-red-600 mb-1">
                            ₹{Math.abs(monthlySummary.worstDay.amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Worst Day</div>
                        <div className="text-xs text-red-500 mt-1">
                            {monthlySummary.worstDay.date || 'N/A'}
                        </div>
                    </div>

                    {/* Profit Factor */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-indigo-600 mb-1">
                            {monthlySummary.profitFactor}
                        </div>
                        <div className="text-xs text-gray-600">Profit Factor</div>
                        <div className="text-xs text-indigo-500 mt-1">Profit/Loss ratio</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* Calendar - Made Much Larger */}
                <div className="xl:col-span-4">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        {/* Calendar Header - Enhanced */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <button
                                onClick={goToPreviousMonth}
                                className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 group"
                                title="Previous Month"
                            >
                                <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                            </button>
                            
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {format(currentDate, 'MMMM yyyy')}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {trades.length} trades • ₹{trades.reduce((sum, t) => sum + (t.profitOrLoss || 0), 0).toFixed(2)} net P&L
                                </p>
                            </div>
                            
                            <button
                                onClick={goToNextMonth}
                                className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 group"
                                title="Next Month"
                            >
                                <ChevronRight className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                            </button>
                        </div>

                        {/* Calendar Grid - Much Larger */}
                        <div className="p-6">
                            {/* Weekday Headers - Larger */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                    <div key={day} className="text-center py-3">
                                        <div className="text-base font-semibold text-gray-700">
                                            {day.slice(0, 3)}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {day.slice(0, 1)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days - Much Larger */}
                            <div className="grid grid-cols-7 gap-3">
                                {calendarDays.map((day) => {
                                    const dateKey = format(day, 'yyyy-MM-dd');
                                    const dayData = tradesByDate.get(dateKey);
                                    const hasTradeData = dayData && dayData.trades.length > 0;
                                    
                                    return (
                                        <button
                                            key={day.toString()}
                                            onClick={() => handleDayClick(day)}
                                            className={`
                                                relative h-24 p-3 rounded-xl border-2 transition-all duration-300 group
                                                ${getDayCellStyle(day)}
                                                ${selectedDate && isSameDay(day, selectedDate) ? 'ring-3 ring-blue-500 ring-offset-2 scale-105' : ''}
                                                ${isToday(day) ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                                                ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}
                                                ${hasTradeData ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default'}
                                                border-transparent
                                            `}
                                            title={hasTradeData ? `${dayData.trades.length} trades on ${format(day, 'MMM d')}` : format(day, 'MMM d')}
                                        >
                                            {/* Day Number - Larger */}
                                            <div className="text-lg font-bold text-gray-900 mb-1">
                                                {format(day, 'd')}
                                            </div>
                                            
                                            {hasTradeData && (
                                                <>
                                                    {/* Enhanced Data Display */}
                                                    {viewMode === 'profit' && (
                                                        <div className={`text-sm font-bold ${
                                                            dayData.totalProfit > 0 ? 'text-green-700' :
                                                            dayData.totalProfit < 0 ? 'text-red-700' : 'text-gray-700'
                                                        }`}>
                                                            {dayData.totalProfit > 0 ? '+' : ''}₹{Math.abs(dayData.totalProfit).toFixed(0)}
                                                        </div>
                                                    )}
                                                    {viewMode === 'volume' && (
                                                        <div className="text-sm font-bold text-blue-700">
                                                            ₹{(dayData.totalVolume / 1000).toFixed(0)}K
                                                        </div>
                                                    )}
                                                    {viewMode === 'count' && (
                                                        <div className="text-sm font-bold text-purple-700">
                                                            {dayData.trades.length} trade{dayData.trades.length !== 1 ? 's' : ''}
                                                        </div>
                                                    )}

                                                    {/* Hover Effect Indicator */}
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-xl transition-all duration-200"></div>
                                                </>
                                            )}

                                            {/* Today Indicator */}
                                            {isToday(day) && (
                                                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Sidebar */}
                <div className="space-y-6">
                    {/* Selected Date Info - Enhanced */}
                    {selectedDate ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                                <h3 className="text-lg font-bold">
                                    {format(selectedDate, 'EEEE')}
                                </h3>
                                <p className="text-blue-100 text-sm">
                                    {format(selectedDate, 'MMMM d, yyyy')}
                                </p>
                            </div>
                            
                            <div className="p-4">
                                {selectedDateTrades.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                {selectedDateTrades.length} trade{selectedDateTrades.length !== 1 ? 's' : ''}
                                            </span>
                                            <span className={`font-bold ${
                                                selectedDateTrades.reduce((sum, t) => sum + (t.profitOrLoss || 0), 0) > 0 
                                                    ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                ₹{selectedDateTrades.reduce((sum, t) => sum + (t.profitOrLoss || 0), 0).toFixed(2)}
                                            </span>
                                        </div>
                                        
                                        <div className="max-h-64 overflow-y-auto space-y-2">
                                            {selectedDateTrades.map((trade, index) => (
                                                <div
                                                    key={trade.id || index}
                                                    className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200 hover:shadow-md border border-transparent hover:border-gray-200"
                                                    onClick={() => {
                                                        setSelectedTrade(trade);
                                                        setShowDetailsModal(true);
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-gray-900">{trade.symbol}</span>
                                                        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                                                            trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {trade.type}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 mb-1">
                                                        Qty: {trade.quantity} @ ₹{trade.entryPrice}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            trade.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                                                            trade.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {trade.status}
                                                        </span>
                                                        {trade.profitOrLoss !== undefined && (
                                                            <div className={`text-sm font-bold ${
                                                                trade.profitOrLoss > 0 ? 'text-green-600' : 
                                                                trade.profitOrLoss < 0 ? 'text-red-600' : 'text-gray-600'
                                                            }`}>
                                                                {trade.profitOrLoss > 0 ? '+' : ''}₹{trade.profitOrLoss.toFixed(2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 mb-2">📅</div>
                                        <div className="text-sm text-gray-500">No trades on this date</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                            <div className="text-gray-400 mb-2">👆</div>
                            <div className="text-sm text-gray-500">Click on any day to view trade details</div>
                        </div>
                    )}

                    {/* Enhanced Monthly Summary */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-2xl">
                            <h3 className="text-lg font-bold">Monthly Summary</h3>
                            <p className="text-indigo-100 text-sm">{format(currentDate, 'MMMM yyyy')}</p>
                        </div>
                        
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{trades.length}</div>
                                    <div className="text-xs text-blue-700">Total Trades</div>
                                </div>
                                <div className="bg-green-50 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-green-600">{trades.filter(t => t.profitOrLoss > 0).length}</div>
                                    <div className="text-xs text-green-700">Winners</div>
                                </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                                    <span className="text-red-700">Losing Trades:</span>
                                    <span className="font-bold text-red-600">
                                        {trades.filter(t => t.profitOrLoss < 0).length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                    <span className="text-blue-700">Open Trades:</span>
                                    <span className="font-bold text-blue-600">
                                        {trades.filter(t => t.status === 'OPEN').length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                                    <span className="text-purple-700">Win Rate:</span>
                                    <span className="font-bold text-purple-600">
                                        {trades.length > 0 ? ((trades.filter(t => t.profitOrLoss > 0).length / trades.filter(t => t.status === 'CLOSED').length) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                            </div>
                            
                            <hr className="my-3" />
                            
                            <div className="bg-gradient-to-r from-green-50 to-red-50 rounded-xl p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Net P&L:</span>
                                    <span className={`text-xl font-bold ${
                                        trades.reduce((sum, t) => sum + (t.profitOrLoss || 0), 0) > 0 
                                            ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        ₹{trades.reduce((sum, t) => sum + (t.profitOrLoss || 0), 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trade Details Modal */}
            {showDetailsModal && selectedTrade && (
                <TradeDetailsModal
                    trade={selectedTrade}
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedTrade(null);
                    }}
                />
            )}
        </div>
    );
};

export default TradeCalendar;
