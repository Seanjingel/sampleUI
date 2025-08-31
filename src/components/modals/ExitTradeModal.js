import React, { useState, useMemo, useRef, useEffect } from "react";

export default function ExitTradeModal({ isOpen, onClose, onSubmit, trade, onExited }) {
  const [exitDate, setExitDate] = useState(null);
  const [exitPrice, setExitPrice] = useState();
  const [exitQuantity, setExitQuantity] = useState(trade?.openQuantity || "");
  const [totalCharges, setTotalCharges] = useState();
  const [brokerage, setBrokerage] = useState();
  const [error, setError] = useState("");
  const [exitTime, setExitTime] = useState(() => {
    // Force IST timezone calculation
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    return `${String(istTime.getHours()).padStart(2, '0')}:${String(istTime.getMinutes()).padStart(2, '0')}`;
  });
  const exitPriceRef = useRef(null);

  // Update exit time every minute to keep it current in IST
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      setExitTime(`${String(istTime.getHours()).padStart(2, '0')}:${String(istTime.getMinutes()).padStart(2, '0')}`);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(()=> {
    if (isOpen) {
      setTimeout(()=> exitPriceRef.current && exitPriceRef.current.focus(), 80);
      const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose]);

  // Calculate Risk/Reward and Estimated P&L
  const { riskReward, estimatedPL, estimatedPLPercent } = useMemo(() => {
    const entryPrice = parseFloat(trade?.entryPrice) || 0.0;
    const stopLoss = parseFloat(trade?.stopLoss);
    const exitPriceVal = exitPrice ?? 0.0;
    const exitQtyVal = exitQuantity ?? 0.0;
    const totalChargesVal = totalCharges ?? 0.0;
    const brokerageVal = brokerage ?? 0.0;
    let riskReward = '--';
    let estimatedPL = 0.0;
    let estimatedPLPercent = 0.0;
    if (entryPrice && !isNaN(stopLoss) && !isNaN(exitPriceVal)) {
      const risk = Math.abs(entryPrice - stopLoss);
      const reward = Math.abs(exitPriceVal - entryPrice);
      riskReward = risk !== 0.0 ? (reward / risk).toFixed(2) : '--';
    }
    if (entryPrice && !isNaN(exitPriceVal) && exitQtyVal) {
      estimatedPL = ((exitPriceVal - entryPrice) * exitQtyVal - totalChargesVal - brokerageVal).toFixed(2);
      estimatedPLPercent = entryPrice ? (((exitPriceVal - entryPrice) / entryPrice) * 100.0).toFixed(2) : 0.0;
    }
    return { riskReward, estimatedPL, estimatedPLPercent };
  }, [trade, exitPrice, exitQuantity, totalCharges, brokerage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate all errors and show the first one only
    if (exitPrice === '' || exitQuantity === '') {
      setError('Exit Price and Quantity are required');
      return;
    }
    if (isNaN(Number(exitPrice)) || isNaN(Number(exitQuantity))) {
      setError('Price and Quantity must be valid numbers');
      return;
    }
    if (exitDate) {
      const entryDate = trade?.entryDate ? new Date(trade.entryDate) : null;
      const selectedExitDate = new Date(exitDate);
      if (entryDate && selectedExitDate < entryDate) {
        setError('Invalid date: Exit date cannot be before entry date');
        return;
      }
    }
    if (parseFloat(exitQuantity) > parseFloat(trade?.quantity)) {
      setError('Exit quantity cannot be greater than entry quantity');
      return;
    }
    setError('');
    // Format entryDate and exitDate as required
    // Format entryDate as "YYYY-MM-DDTHH:mm:00" (remove any extra T/time)
    let formattedEntryDate;
    if (trade?.entryDate) {
      // If entryDate is already in ISO format, just take the date and time part
      const entryDateObj = new Date(trade.entryDate);
      formattedEntryDate = `${entryDateObj.getFullYear()}-${String(entryDateObj.getMonth()+1).padStart(2,'0')}-${String(entryDateObj.getDate()).padStart(2,'0')}T${String(entryDateObj.getHours()).padStart(2,'0')}:${String(entryDateObj.getMinutes()).padStart(2,'0')}:00`;
    } else {
      const now = new Date();
      formattedEntryDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:00`;
    }
    // Format exitDate as "YYYY-MM-DDTHH:mm:00" using current IST time
    let formattedExitDate;
    if (exitDate) {
      // Use current IST time when exitDate is provided
      const currentTime = new Date();
      const istTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const hours = String(istTime.getHours()).padStart(2, '0');
      const minutes = String(istTime.getMinutes()).padStart(2, '0');
      formattedExitDate = `${exitDate}T${hours}:${minutes}:00`;
    } else {
      // Use current IST date and time if no exitDate is provided
      const currentTime = new Date();
      const istTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const year = istTime.getFullYear();
      const month = String(istTime.getMonth() + 1).padStart(2, '0');
      const day = String(istTime.getDate()).padStart(2, '0');
      const hours = String(istTime.getHours()).padStart(2, '0');
      const minutes = String(istTime.getMinutes()).padStart(2, '0');
      formattedExitDate = `${year}-${month}-${day}T${hours}:${minutes}:00`;
    }
    onSubmit({
      tradeId: trade.id,
      entryDate: formattedEntryDate,
      exitDate: formattedExitDate,
      exitPrice: exitPrice,
      exitQty: parseFloat(exitQuantity) || 0.0,
      totalCharges: parseFloat(totalCharges) || 0.0,
      brokerage: parseFloat(brokerage) || 0.0,
      // Calculate and pass profitOrLoss for partial exit
      profitOrLoss: ((parseFloat(exitPrice) - parseFloat(trade.entryPrice)) * (parseFloat(exitQuantity) || 0.0) - (parseFloat(totalCharges) || 0.0) - (parseFloat(brokerage) || 0.0)).toFixed(2)
    });
    onClose();
    if (typeof onExited === 'function') {
      onExited();
    }
  };

  if (!isOpen) return null;

  // Handler to close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Clear error on input change
  const handleExitDateChange = (e) => {
    setExitDate(e.target.value ? e.target.value : null);
    setError('');
  };
  // Ensure exitQty is always a number for calculation
  const handleExitQtyChange = (e) => {
    const value = e.target.value;
    setExitQuantity(value === '' ? '' : value);
    setError('');
  };

  // Ensure exitPrice is always a number for calculation
  const handleExitPriceChange = (e) => {
    const value = e.target.value;
    setExitPrice(value === '' ? undefined : parseFloat(value));
    setError('');
  };
  const handleTotalChargesChange = (e) => {
    const value = e.target.value;
    setTotalCharges(value === '' ? undefined : parseFloat(value));
    setError('');
  };
  const handleBrokerageChange = (e) => {
    const value = e.target.value;
    setBrokerage(value === '' ? undefined : parseFloat(value));
    setError('');
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 px-2 sm:px-6 py-6 overflow-y-auto`} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="exit-trade-title">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl xl:max-w-3xl p-6 relative" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
          <h2 id="exit-trade-title" className="text-lg sm:text-xl font-semibold">
            Exit Trade - {trade?.symbol}{" "}
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full border">
              Open
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {/* Trade details */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg mb-4 text-sm">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium">{trade?.type}</p>
            <p className="text-gray-500 mt-2">Entry Price</p>
            <p className="font-medium">{trade?.entryPrice}</p>
          </div>
          <div>
            <p className="text-gray-500">Quantity</p>
            <p className="font-medium">{trade?.quantity}</p>
            <p className="text-gray-500 mt-2">Stop Loss</p>
            <p className="font-medium text-red-500">{trade?.stopLoss}</p>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-3" role="alert">{error}</p>}
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exit Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Exit Date
              </label>
              <input
                type="date"
                value={exitDate !== null ? exitDate : new Date().toISOString().slice(0, 10)}
                onChange={handleExitDateChange}
                className="w-full p-2 border rounded-lg"
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Exit Time
              </label>
              <input
                type="time"
                value={exitTime} // Always use current time
                readOnly
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>
          {/* Exit Price & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Exit Price <span className="text-red-500">*</span>
                </label>
                <input
                  ref={exitPriceRef}
                  type="number"
                  value={exitPrice === undefined ? '' : exitPrice}
                  onChange={handleExitPriceChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Exit Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={exitQuantity}
                  onChange={handleExitQtyChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          {/* Charges */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Charges
              </label>
              <input
                type="number"
                value={totalCharges === undefined ? '' : totalCharges}
                onChange={handleTotalChargesChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Brokerage
              </label>
              <input
                type="number"
                value={brokerage === undefined ? '' : brokerage}
                onChange={handleBrokerageChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
          {/* Risk / Reward & Estimated P&L */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-500">
            <p>Risk/Reward — <span className="text-gray-700">{riskReward}</span></p>
            <p className="mt-1">
              Estimated P&amp;L —
              <span className={`ml-1 font-medium ${parseFloat(estimatedPL) > 0 ? 'text-green-600' : parseFloat(estimatedPL) < 0 ? 'text-red-600' : 'text-gray-700'}`}>₹{estimatedPL}</span>
              <span className={`ml-2 text-xs px-1 py-0.5 rounded ${parseFloat(estimatedPLPercent) > 0 ? 'bg-green-100 text-green-700' : parseFloat(estimatedPLPercent) < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                {estimatedPLPercent}%
              </span>
            </p>
          </div>
          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!error || exitPrice === undefined || exitPrice === '' || exitQuantity === ''}
              className={`px-4 py-2 rounded-lg text-white ${!!error || exitPrice === undefined || exitPrice === '' || exitQuantity === '' ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
            >
              Exit Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
