import React, { useState } from 'react';
import { Minus, X, AlertTriangle } from 'lucide-react';

const WithdrawFundModal = ({ isOpen, onClose, onSubmit, availableBalance = 0 }) => {
    const [formData, setFormData] = useState({
        amount: '',
        withdrawMethod: 'bank_transfer',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const withdrawMethods = [
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'upi', label: 'UPI' },
        { value: 'cash', label: 'Cash' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const amount = parseFloat(formData.amount);
        
        if (!formData.amount || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (amount > availableBalance) {
            setError(`Insufficient balance. Available: ₹${availableBalance.toLocaleString()}`);
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                amount: amount,
                type: 'WITHDRAWAL'
            });
            
            // Reset form
            setFormData({
                amount: '',
                withdrawMethod: 'bank_transfer',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            onClose();
        } catch (error) {
            setError(error.message || 'Failed to withdraw funds');
        } finally {
            setLoading(false);
        }
    };

    const handleMaxAmount = () => {
        setFormData(prev => ({
            ...prev,
            amount: availableBalance.toString()
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Minus className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Withdraw Funds</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Available Balance Info */}
                <div className="px-6 pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <div className="text-blue-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm text-blue-800">
                                Available Balance: <span className="font-semibold">₹{availableBalance.toLocaleString()}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                required
                                min="0"
                                max={availableBalance}
                                step="0.01"
                            />
                            <button
                                type="button"
                                onClick={handleMaxAmount}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    {/* Withdraw Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Withdrawal Method
                        </label>
                        <select
                            name="withdrawMethod"
                            value={formData.withdrawMethod}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            {withdrawMethods.map(method => (
                                <option key={method.value} value={method.value}>
                                    {method.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Add a note about this withdrawal..."
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                        />
                    </div>

                    {/* Warning */}
                    {parseFloat(formData.amount) > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm text-yellow-800">
                                    This will reduce your available trading balance by ₹{parseFloat(formData.amount || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || parseFloat(formData.amount || 0) > availableBalance}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Minus className="h-4 w-4" />
                                    Withdraw
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawFundModal;
