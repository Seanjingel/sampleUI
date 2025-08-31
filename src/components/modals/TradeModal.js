import { useState, useEffect, useRef } from "react";
import { addTrade, updateTrade } from '../../api/tradeService';
import {LineChart, NotebookPen  } from "lucide-react";
import sampleStockSymbols from '../../utils/sampleStockSymbols.json';
import tradeEnums from '../../utils/tradeEnums';

export default function TradeModal({ isOpen, onClose, onSave, editTrade }) {
    const [activeTab, setActiveTab] = useState("trade");
    const [formData, setFormData] = useState({
        symbol: "",
        tradeType: "",
        entryDate: "",
        entryTime: getCurrentTime(),
        entryPrice: "",
        quantity: "",
        stopLoss: "",
        target: "",
        exitPrice: "",
        exitQuantity: "", // <-- add this line
        exitDate: "",
        exitTime: getCurrentTime(),
        notes: "",
        tags: [], // change to array
        screenshot: null,
        setup: "",
        mood: "",
        charges: ""
    });
    const [validationError, setValidationError] = useState("");
    const firstFieldRef = useRef(null);
    const formRef = useRef(null);

    function getCurrentTime() {
        const now = new Date();
        return now.toTimeString().slice(0,5); // "HH:MM" format
    }

    // Focus first field & add Escape handler when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => firstFieldRef.current && firstFieldRef.current.focus(), 50);
            const handleKey = (e) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleKey);
            return () => window.removeEventListener('keydown', handleKey);
        }
    }, [isOpen, onClose]);

    // Prefill form if editing
    useEffect(() => {
        if (editTrade) {
            setFormData(prevFormData => {
                const updatedForm = { ...prevFormData };
                Object.keys(prevFormData).forEach(key => {
                    if (
                        editTrade[key] !== undefined &&
                        editTrade[key] !== null &&
                        editTrade[key] !== ""
                    ) {
                        // Special handling for entryPrice to avoid 0
                        if (key === "entryPrice" && Number(editTrade[key]) === 0) {
                            // skip updating entryPrice if 0
                            return;
                        }
                        updatedForm[key] = editTrade[key];
                    }
                });
                // For tradeType, use editTrade.type if present
                if (editTrade.type !== undefined && editTrade.type !== null && editTrade.type !== "") {
                    updatedForm.tradeType = editTrade.type;
                }
                // Set entryDate and entryTime from editTrade.entryDate if present
                if (editTrade.entryDate) {
                    const entryDateObj = new Date(editTrade.entryDate);
                    updatedForm.entryDate = `${entryDateObj.getFullYear()}-${String(entryDateObj.getMonth()+1).padStart(2,'0')}-${String(entryDateObj.getDate()).padStart(2,'0')}`;
                    updatedForm.entryTime = `${String(entryDateObj.getHours()).padStart(2,'0')}:${String(entryDateObj.getMinutes()).padStart(2,'0')}`;
                }
                return updatedForm;
            });
        }
    }, [editTrade, isOpen]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        const newFormData = {
            ...formData,
            [name]: files ? files[0] : value
        };
        // Immediate validation for stop loss and target
        const entry = parseFloat(newFormData.entryPrice);
        const stop = parseFloat(newFormData.stopLoss);
        const target = parseFloat(newFormData.target);
        let error = "";
        if (newFormData.entryPrice && newFormData.stopLoss && stop >= entry) {
            error = "Stop loss should be less than entry price.";
        }
        if (newFormData.entryPrice && newFormData.target && target <= entry) {
            error = "Target price should be greater than entry price.";
        }
        setValidationError(error);
        setFormData(newFormData);
    };

    const handleTagChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, tags: selectedOptions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation for stop loss and target
        if (validationError) {
            alert(validationError);
            return;
        }
        // Ensure entryDate is set to today if empty
        let entryDateToUse = formData.entryDate || new Date().toISOString().slice(0, 10);
        let entryTimeToUse = formData.entryTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // Combine entryDate and entryTime for exitDate if needed
        let exitDateToUse = formData.exitDate;
        if (formData.exitPrice && !formData.exitDate) {
            exitDateToUse = `${entryDateToUse}T${entryTimeToUse}`;
        }
        const payload = {
            symbol: formData.symbol,
            type: formData.tradeType,
            entryPrice: formData.entryPrice || (editTrade ? editTrade.entryPrice : undefined),
            stopLoss: formData.stopLoss,
            target: formData.target,
            quantity: formData.quantity,
            exitPrice: formData.exitPrice,
            exitQuantity: formData.exitQuantity,
            exitDate: exitDateToUse,
            notes: formData.notes,
            tags: formData.tags,
            // Format entryDate as 'YYYY-MM-DDTHH:mm:00' (remove extra T/time)
            entryDate: (() => {
                let dateObj;
                if (formData.entryDate) {
                    // If entryDate is provided, combine with entryTime if available
                    if (formData.entryTime) {
                        dateObj = new Date(formData.entryDate + 'T' + formData.entryTime);
                    } else {
                        dateObj = new Date(formData.entryDate);
                    }
                } else {
                    // Use current date and time if not provided
                    dateObj = new Date();
                }
                // If dateObj is invalid, fallback to current date/time
                if (isNaN(dateObj.getTime())) {
                    dateObj = new Date();
                }
                return `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}T${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}:00`;
            })(),
            screenshot: formData.screenshot,
            setup: formData.setup,
            mood: formData.mood
        };
        try {
            if (editTrade && editTrade.id) {
                await updateTrade(editTrade.id, payload);
            } else {
                await addTrade(payload);
            }
            if (typeof onSave === 'function') {
                onSave(payload);
            }
            setTimeout(() => window.location.reload(), 60);
        } catch (error) {
            console.error(error);
            alert('Failed to save trade.');
        }
    };

    // Autocomplete states for symbol (must be before any return)
    const [symbolQuery, setSymbolQuery] = useState("");
    const [symbolSuggestions, setSymbolSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Update symbolQuery and suggestions when formData.symbol changes (for edit mode)
    useEffect(() => {
        setSymbolQuery(formData.symbol || "");
    }, [formData.symbol]);

    // Filter suggestions as user types
    useEffect(() => {
        if (symbolQuery.trim().length === 0) {
            setSymbolSuggestions([]);
            setShowSuggestions(false);
            setHighlightedIndex(-1);
            return;
        }
        const query = symbolQuery.trim().toLowerCase();
        const filtered = sampleStockSymbols.filter(
            s => s.symbol.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
        ).slice(0, 10); // Limit to 10 suggestions
        setSymbolSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setHighlightedIndex(-1);
    }, [symbolQuery]);

    if (!isOpen) return null;

    const isSaveDisabled = !!validationError || !formData.symbol || !formData.tradeType || !formData.entryPrice || !formData.quantity;

    // Symbol input change handler
    const handleSymbolInputChange = (e) => {
        const value = e.target.value.toUpperCase();
        setSymbolQuery(value);
        setFormData(prev => ({ ...prev, symbol: value }));
        setShowSuggestions(true);
    };

    // Suggestion click handler
    const handleSuggestionClick = (symbol) => {
        setFormData(prev => ({ ...prev, symbol }));
        setSymbolQuery(symbol);
        setShowSuggestions(false);
    };

    // Keyboard navigation for suggestions
    const handleSymbolInputKeyDown = (e) => {
        if (!showSuggestions || symbolSuggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            setHighlightedIndex(i => Math.min(i + 1, symbolSuggestions.length - 1));
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            setHighlightedIndex(i => Math.max(i - 1, 0));
            e.preventDefault();
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
            handleSuggestionClick(symbolSuggestions[highlightedIndex].symbol);
            e.preventDefault();
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 px-2 sm:px-6 py-6 overflow-y-auto`}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trade-modal-title"
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl xl:max-w-3xl p-4 sm:p-8 relative border border-blue-100"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2 border-b">
                    <h2 id="trade-modal-title" className="text-lg sm:text-xl font-semibold">
                        {editTrade ? 'Edit Trade' : 'New Trade'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-xl"
                        type="button"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>
                {/* Tabs */}
                <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                    {[
                        {key: "trade", label: "Trade", icon: <LineChart size={18}/>},
                        {key: "journal", label: "Journal", icon: <NotebookPen size={18}/>},
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            type="button"
                            className={`flex items-center justify-center gap-2 flex-1 py-2 rounded-md font-medium capitalize transition-all duration-200 ${
                                activeTab === tab.key
                                    ? "bg-gradient-to-r from-cyan-700 to-gray-900 text-white shadow-md"
                                    : "text-gray-600 hover:text-blue-500"
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === "trade" && (
                        <>
                            {/* Symbol Row - Autocomplete */}
                            <div className="mb-4 relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                                <input
                                    ref={firstFieldRef}
                                    type="text"
                                    name="symbol"
                                    value={symbolQuery}
                                    onChange={handleSymbolInputChange}
                                    onKeyDown={handleSymbolInputKeyDown}
                                    autoComplete="off"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="Type symbol or company name"
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                                />
                                {showSuggestions && symbolSuggestions.length > 0 && (
                                    <ul className="absolute z-20 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                        {symbolSuggestions.map((s, idx) => (
                                            <li
                                                key={s.symbol}
                                                className={`px-3 py-2 cursor-pointer flex justify-between items-center ${idx === highlightedIndex ? 'bg-blue-100' : ''}`}
                                                onMouseDown={() => handleSuggestionClick(s.symbol)}
                                                onMouseEnter={() => setHighlightedIndex(idx)}
                                            >
                                                <span className="font-semibold">{s.symbol}</span>
                                                <span className="text-gray-500 ml-2 text-xs">{s.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {/* Trade Type, Entry Date, Entry Time Row */}
                            <div className="grid grid-cols-3 gap-4 mb-2">
                                <div>
                                    <label className="block text-sm font-medium">Trade Type</label>
                                    <select
                                        name="tradeType"
                                        value={formData.tradeType}
                                        onChange={handleChange}
                                        className={`w-full border rounded-lg p-2 text-sm ${formData.tradeType === 'buy' ? 'text-green-600' : formData.tradeType === 'sell' ? 'text-red-600' : ''}`}
                                    >
                                        <option value="">Select</option>
                                        <option value="buy">LONG</option>
                                        <option value="sell">SHORT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Entry Date</label>
                                    <input
                                        type="date"
                                        name="entryDate"
                                        value={formData.entryDate || new Date().toISOString().slice(0, 10)}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Entry Time</label>
                                    <input
                                        type="time"
                                        name="entryTime"
                                        value={formData.entryTime}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 text-sm"
                                    />
                                </div>
                            </div>
                            {/* Entry Price & Quantity Row */}
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                    <label className="block text-sm font-medium">Entry Price</label>
                                    <input
                                        type="number"
                                        name="entryPrice"
                                        placeholder="e.g. 1500"
                                        value={formData.entryPrice}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="quantity"
                                           className="block text-xs md:text-sm font-medium">Quantity</label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        name="quantity"
                                        placeholder="e.g. 100"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 text-xs md:text-sm"
                                    />
                                </div>
                            </div>
                            {/* Stop Loss & Target Row */}
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                    <label className="block text-sm font-medium">Stop Loss</label>
                                    <input
                                        type="number"
                                        name="stopLoss"
                                        placeholder="e.g. 1450"
                                        value={formData.stopLoss}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 text-sm"
                                    />
                                    {/* Risk per trade (read-only) */}
                                    {formData.stopLoss && formData.entryPrice && formData.quantity && (
                                        (() => {
                                            const entry = parseFloat(formData.entryPrice);
                                            const stop = parseFloat(formData.stopLoss);
                                            const qty = parseFloat(formData.quantity);
                                            let risk = '';
                                            if (formData.tradeType === 'buy') {
                                                risk = ((entry - stop) * qty).toFixed(2);
                                            } else if (formData.tradeType === 'sell') {
                                                risk = ((stop - entry) * qty).toFixed(2);
                                            }
                                            // For risk, positive means loss, negative/zero means no risk/profit
                                            const isLoss = parseFloat(risk) > 0;
                                            return (
                                                <div
                                                    className={`mt-1 text-xs font-semibold ${isLoss ? 'text-red-600' : 'text-green-600'}`}>
                                                    Risk per trade: {risk}
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Target Price</label>
                                    <input
                                        type="number"
                                        name="target"
                                        placeholder="e.g. 1550"
                                        value={formData.target}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 text-sm"
                                    />
                                    {/* Estimated P&L (read-only) */}
                                    {formData.target && formData.entryPrice && formData.quantity && (
                                        (() => {
                                            const entry = parseFloat(formData.entryPrice);
                                            const target = parseFloat(formData.target);
                                            const qty = parseFloat(formData.quantity);
                                            let pnl = '';
                                            if (formData.tradeType === 'buy') {
                                                pnl = ((target - entry) * qty).toFixed(2);
                                            } else if (formData.tradeType === 'sell') {
                                                pnl = ((entry - target) * qty).toFixed(2);
                                            }
                                            const isProfit = parseFloat(pnl) > 0;
                                            return (
                                                <div
                                                    className={`mt-1 text-xs font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                                    <span className="font-semibold">Estimated P&amp;L:</span> {pnl}
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                            </div>
                            {/* Exit Price & Exit Quantity Row */}
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                    <label htmlFor="exitPrice" className="block text-xs md:text-sm font-medium">Exit
                                        Price</label>
                                    <input
                                        id="exitPrice"
                                        type="number"
                                        name="exitPrice"
                                        placeholder="e.g. 1540"
                                        value={formData.exitPrice}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="exitQuantity" className="block text-xs md:text-sm font-medium">Exit
                                        Quantity</label>
                                    <input
                                        id="exitQuantity"
                                        type="number"
                                        name="exitQuantity"
                                        placeholder="e.g. 100"
                                        value={formData.exitQuantity || ''}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 text-xs md:text-sm"
                                    />
                                </div>
                            </div>
                            {/* Charges Row */}
                            <div className="mb-2">
                                <label htmlFor="charges" className="block text-xs md:text-sm font-medium">Charges
                                    (₹)</label>
                                <input
                                    id="charges"
                                    type="number"
                                    name="charges"
                                    placeholder="Auto-calculated for Indian market"
                                    value={formData.exitPrice ? (formData.charges || calculateCharges(formData)) : ''}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 text-xs md:text-sm"
                                />
                            </div>
                            {/* P&L Row */}
                            {formData.exitPrice && formData.entryPrice && formData.exitQuantity && (
                                <div className="mb-2">
                                    <label className="block text-xs md:text-sm font-medium">Estimated P&L</label>
                                    <div className={
                                        parseFloat(calculatePL(formData)) > 0
                                            ? "font-semibold text-green-700"
                                            : "font-semibold text-red-700"
                                    }>
                                        ₹{calculatePL(formData)}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "journal" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Notes</label>
                                <textarea
                                    name="notes"
                                    placeholder="Write your trade review..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 h-24 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Tags</label>
                                <select
                                    multiple
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleTagChange}
                                    className="w-full border rounded-lg p-2 text-sm h-32"
                                >
                                    {tradeEnums.tags.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                                <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Command (Mac) to select multiple tags.</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Setup</label>
                                <select
                                    name="setup"
                                    value={formData.setup}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 text-sm"
                                >
                                    <option value="">Select</option>
                                    {tradeEnums.setup.map(setup => (
                                        <option key={setup} value={setup}>{setup}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Mood</label>
                                <select
                                    name="mood"
                                    value={formData.mood || ''}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 text-sm"
                                >
                                    <option value="">Select</option>
                                    <option value="confident">Confident</option>
                                    <option value="neutral">Neutral</option>
                                    <option value="anxious">Anxious</option>
                                    <option value="excited">Excited</option>
                                    <option value="stressed">Stressed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Chart Screenshots</label>
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition w-full"
                                    style={{minHeight: '120px'}}
                                    onClick={() => document.getElementById('screenshot-upload').click()}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                            handleChange({target: {name: 'screenshot', files: [file]}});
                                        }
                                    }}
                                >
                                    {formData.screenshot ? (
                                        <div className="w-full flex flex-col items-center">
                                            <img
                                                src={URL.createObjectURL(formData.screenshot)}
                                                alt="Screenshot Preview"
                                                className="max-h-40 object-contain mb-2 rounded"
                                            />
                                            <button
                                                type="button"
                                                className="text-xs text-red-500 underline"
                                                onClick={() => handleChange({target: {name: 'screenshot', files: []}})}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Drag & drop or click to upload chart screenshot</span>
                                    )}
                                    <input
                                        id="screenshot-upload"
                                        type="file"
                                        name="screenshot"
                                        accept="image/*"
                                        style={{display: 'none'}}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show validation error immediately below the form fields */}
                    {validationError && (
                        <div className="text-red-600 text-xs font-semibold mb-2" role="alert">{validationError}</div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-900 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaveDisabled}
                            className={`px-4 py-2 rounded-lg text-white transition-colors ${isSaveDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-green-900'}`}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helper functions
function calculateCharges(formData) {
    // Example: Brokerage (₹20 per trade), STT (0.025%), Exchange Txn (0.00325%), GST (18% on brokerage+txn), SEBI (₹10 per crore), Stamp (0.003%)
    const entry = parseFloat(formData.entryPrice) || 0;
    const exit = parseFloat(formData.exitPrice) || 0;
    const exitQty = parseFloat(formData.exitQuantity) || 0;
    const turnover = (entry + exit) * exitQty;
    const brokerage = 20; // Flat per trade
    const stt = exit * exitQty * 0.00025;
    const exchange = turnover * 0.0000325;
    const gst = (brokerage + exchange) * 0.18;
    const sebi = turnover * 0.000001;
    const stamp = entry * exitQty * 0.00003;
    return (brokerage + stt + exchange + gst + sebi + stamp).toFixed(2);
}
function calculatePL(formData) {
    const entry = parseFloat(formData.entryPrice) || 0;
    const exit = parseFloat(formData.exitPrice) || 0;
    const qty = parseFloat(formData.exitQuantity) || 0;
    const charges = parseFloat(formData.charges || calculateCharges(formData)) || 0;
    return ((exit - entry) * qty - charges).toFixed(2);
}
