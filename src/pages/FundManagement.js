import React, { useState, useMemo } from 'react';
import { 
    Wallet, 
    TrendingUp, 
    TrendingDown, 
    Plus, 
    Minus, 
    Eye, 
    EyeOff,
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    CreditCard,
    PiggyBank
} from 'lucide-react';
import AddFundModal from '../components/modals/AddFundModal';
import WithdrawFundModal from '../components/modals/WithdrawFundModal';
import { addFund as legacyAddFund, withdrawFund as legacyWithdrawFund } from '../api/FundService'; // fallback if needed
import useFundSummary from '../hooks/useFundSummary';

const FundManagement = () => {
    // Hook data
    const {
        summary,
        transactions,
        transactionFilter,
        setTransactionFilter,
        addFund,
        withdrawFund,
        error: hookError,
    } = useFundSummary({ initialPeriod: '1M', pageSize: 10 });

    // Local UI state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showBalance, setShowBalance] = useState(true);
    const error = hookError;

    const transactionFilters = [
        { value: 'ALL', label: 'All Transactions' },
        { value: 'DEPOSIT', label: 'Deposits' },
        { value: 'WITHDRAWAL', label: 'Withdrawals' },
        { value: 'TRADE_PROFIT', label: 'Trade Profits' },
        { value: 'TRADE_LOSS', label: 'Trade Losses' }
    ];

    // Handlers via hook (fallback to legacy if hook not ready)
    const handleAddFund = async (fundData) => {
        await (addFund ? addFund(fundData) : legacyAddFund(fundData));
    };
    const handleWithdrawFund = async (withdrawData) => {
        await (withdrawFund ? withdrawFund(withdrawData) : legacyWithdrawFund(withdrawData));
    };

    const performanceMetrics = useMemo(() => {
        const totalReturns = summary?.totalPnL || 0;
        const totalInvested = (summary?.totalDeposits || 0) - (summary?.totalWithdrawals || 0);
        const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
        
        return {
            totalReturns,
            returnPercentage,
            totalInvested
        };
    }, [summary]);

    const formatCurrency = (amount) => {
        return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'DEPOSIT':
                return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
            case 'WITHDRAWAL':
                return <ArrowUpRight className="h-4 w-4 text-red-600" />;
            case 'TRADE_PROFIT':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'TRADE_LOSS':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            default:
                return <DollarSign className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case 'DEPOSIT':
            case 'TRADE_PROFIT':
                return 'text-green-600';
            case 'WITHDRAWAL':
            case 'TRADE_LOSS':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    if (summary.loading && !summary?.totalBalance) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-7xl mx-auto min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
                        >
                            <Plus className="h-5 w-5" />
                            Add Funds
                        </button>
                        <button
                            onClick={() => setShowWithdrawModal(true)}
                            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
                        >
                            <Minus className="h-5 w-5" />
                            Withdraw
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                        {error}
                    </div>
                )}
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Balance */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl text-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                            <PiggyBank className="h-6 w-6" />
                        </div>
                        <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                        >
                            {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                    </div>
                    <div className="space-y-2">
                        <p className="text-blue-200 text-sm">Total Balance</p>
                        <p className="text-3xl font-bold">
                            {showBalance ? formatCurrency(summary?.totalBalance || 0) : '₹••••••'}
                        </p>
                    </div>
                </div>

                {/* Available Balance */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <CreditCard className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Available Balance</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {showBalance ? formatCurrency(summary?.availableBalance || 0) : '₹••••••'}
                            </p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        Ready to trade
                    </div>
                </div>

                {/* Invested Amount */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Invested</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {showBalance ? formatCurrency(summary?.investedAmount || 0) : '₹••••••'}
                            </p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        In active trades
                    </div>
                </div>

                {/* Day P&L */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-xl ${(summary?.dayPnL||0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                            {(summary?.dayPnL||0) >= 0 ? 
                                <TrendingUp className="h-6 w-6 text-green-600" /> : 
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            }
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Day P&L</p>
                            <p className={`text-2xl font-bold ${(summary?.dayPnL||0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {showBalance ? 
                                    `${(summary?.dayPnL||0) >= 0 ? '+' : ''}${formatCurrency(summary?.dayPnL||0)}` : 
                                    '₹••••••'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        Today's performance
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Total Returns */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Total Returns</h3>
                        <div className={`p-2 rounded-lg ${performanceMetrics.totalReturns >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                            {performanceMetrics.totalReturns >= 0 ? 
                                <TrendingUp className="h-5 w-5 text-green-600" /> : 
                                <TrendingDown className="h-5 w-5 text-red-600" />
                            }
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className={`text-3xl font-bold ${performanceMetrics.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {performanceMetrics.totalReturns >= 0 ? '+' : ''}{formatCurrency(performanceMetrics.totalReturns)}
                        </p>
                        <p className={`text-sm ${performanceMetrics.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {performanceMetrics.returnPercentage >= 0 ? '+' : ''}{performanceMetrics.returnPercentage.toFixed(2)}% return
                        </p>
                    </div>
                </div>

                {/* Total Deposits */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Total Deposits</h3>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ArrowDownLeft className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(summary?.totalDeposits || 0)}
                        </p>
                        <p className="text-sm text-gray-600">
                            Money added
                        </p>
                    </div>
                </div>

                {/* Total Withdrawals */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Total Withdrawals</h3>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ArrowUpRight className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(summary?.totalWithdrawals || 0)}
                        </p>
                        <p className="text-sm text-gray-600">
                            Money withdrawn
                        </p>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h3 className="text-xl font-semibold text-gray-900">Transaction History</h3>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={transactionFilter}
                                onChange={(e) => setTransactionFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {transactionFilters.map(filter => (
                                    <option key={filter.value} value={filter.value}>
                                        {filter.label}
                                    </option>
                                ))}
                            </select>
                            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Download className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {transactions.length > 0 ? (
                        <div className="space-y-4">
                            {transactions.map((transaction, index) => (
                                <div key={transaction.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            {getTransactionIcon(transaction.type)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {transaction.description || transaction.type.replace('_', ' ')}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Today'} • 
                                                {transaction.method && ` ${transaction.method.replace('_', ' ')}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                                            {transaction.type === 'DEPOSIT' || transaction.type === 'TRADE_PROFIT' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {transaction.status || 'Completed'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Wallet className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                            <p className="text-gray-600 mb-6">Start by adding funds to your account</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Your First Deposit
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddFundModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddFund}
            />

            <WithdrawFundModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onSubmit={handleWithdrawFund}
                availableBalance={summary?.availableBalance || 0}
            />
        </div>
    );
};

export default FundManagement;
