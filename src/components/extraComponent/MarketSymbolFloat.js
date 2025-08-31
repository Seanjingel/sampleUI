import React, { useState, useRef, useEffect } from "react";

const MOCK_SYMBOLS = [
  { symbol: "RELIANCE", price: 2520.50, change: +12.30, percent: +0.49, history: [2500, 2510, 2515, 2520.5] },
  { symbol: "TCS", price: 3840.10, change: -8.20, percent: -0.21, history: [3850, 3845, 3842, 3840.1] },
  { symbol: "INFY", price: 1562.00, change: +5.10, percent: +0.33, history: [1550, 1555, 1560, 1562] },
  { symbol: "HDFCBANK", price: 1680.75, change: -2.50, percent: -0.15, history: [1685, 1683, 1682, 1680.75] },
  { symbol: "SBIN", price: 610.20, change: +3.80, percent: +0.63, history: [605, 607, 609, 610.2] },
  { symbol: "ICICIBANK", price: 980.00, change: +1.20, percent: +0.12, history: [978, 979, 979.5, 980] },
  { symbol: "ADANIENT", price: 2850.00, change: -15.00, percent: -0.52, history: [2865, 2860, 2855, 2850] },
];

const API_URL = "https://latest-stock-price.p.rapidapi.com/price?Indices=NIFTY%2050";
const API_HEADERS = {
  "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY", // <-- Replace with your RapidAPI key
  "X-RapidAPI-Host": "latest-stock-price.p.rapidapi.com"
};

export default function MarketSymbolFloat() {
  const [visible, setVisible] = useState(true);
  const [search, setSearch] = useState("");
  const [symbols, setSymbols] = useState(MOCK_SYMBOLS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("marketWatchlist") || "[]");
    } catch { return []; }
  });
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ x: 40, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Fetch live data
  const fetchLiveData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, { headers: API_HEADERS });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      // Map API data to our format
      const mapped = data.map(s => ({
        symbol: s.symbol,
        price: s.lastPrice,
        change: s.change,
        percent: s.pChange,
        history: [s.lastPrice - s.change, s.lastPrice] // Simple 2-point history
      }));
      setSymbols(mapped);
    } catch (e) {
      setError("Live data unavailable, showing mock data.");
      setSymbols(MOCK_SYMBOLS);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  // Watchlist persistence
  useEffect(() => {
    localStorage.setItem("marketWatchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Filtered symbols
  const filtered = symbols.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase())
  );

  // Drag handlers
  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        setPos({
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        });
      }
    };
    const handleMouseUp = () => setDragging(false);
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset]);

  // Watchlist actions
  const toggleWatch = (symbol) => {
    setWatchlist(watchlist =>
      watchlist.includes(symbol)
        ? watchlist.filter(s => s !== symbol)
        : [...watchlist, symbol]
    );
  };
  const clearWatchlist = () => setWatchlist([]);

  if (!visible) return (
    <button
      className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700"
      onClick={() => setVisible(true)}
      aria-label="Show Market Symbols"
    >
      Show Market
    </button>
  );

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-white border border-blue-200 rounded-xl shadow-2xl w-80 max-w-xs"
      style={{ left: pos.x, top: pos.y, minWidth: 280 }}
      role="dialog"
      aria-label="Market Symbol Float"
    >
      <div
        className="cursor-move bg-blue-600 text-white px-4 py-2 rounded-t-xl flex justify-between items-center select-none"
        onMouseDown={handleMouseDown}
      >
        <span className="font-semibold">NSE Market Symbols</span>
        <div className="flex gap-2 items-center">
          <button
            className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded hover:bg-yellow-200"
            onClick={clearWatchlist}
            title="Clear Watchlist"
          >Clear</button>
          <button
            className="ml-2 text-white hover:text-yellow-200 text-lg"
            onClick={() => setVisible(false)}
            aria-label="Hide Market Symbols"
          >
            ×
          </button>
        </div>
      </div>
      <div className="p-3">
        <input
          type="text"
          className="w-full border rounded px-2 py-1 mb-2 text-sm"
          placeholder="Search symbol..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading && <div className="text-blue-600 text-sm py-2 text-center">Loading...</div>}
        {error && <div className="text-red-600 text-xs py-1 text-center">{error}</div>}
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-gray-500 text-sm py-6 text-center">No symbols found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="text-left py-1">Symbol</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">Change</th>
                  <th className="text-right py-1">%</th>
                  <th className="text-center py-1">Chart</th>
                  <th className="text-center py-1">★</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.symbol} className="border-b last:border-b-0">
                    <td className="font-bold text-blue-700 py-1">{s.symbol}</td>
                    <td className="text-right py-1">₹{s.price.toFixed(2)}</td>
                    <td className={`text-right py-1 font-semibold ${s.change > 0 ? 'text-green-600' : s.change < 0 ? 'text-red-600' : 'text-gray-700'}`}>{s.change > 0 ? '+' : ''}{s.change.toFixed(2)}</td>
                    <td className={`text-right py-1 font-semibold ${s.percent > 0 ? 'text-green-600' : s.percent < 0 ? 'text-red-600' : 'text-gray-700'}`}>{s.percent > 0 ? '+' : ''}{s.percent.toFixed(2)}</td>
                    <td className="text-center py-1">
                      <button
                        className={`text-lg ${watchlist.includes(s.symbol) ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                        onClick={() => toggleWatch(s.symbol)}
                        title={watchlist.includes(s.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        aria-label="Toggle Watchlist"
                      >★</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {watchlist.length > 0 && (
          <div className="mt-3 border-t pt-2">
            <div className="font-semibold text-xs text-blue-700 mb-1">Watchlist:</div>
            <div className="flex flex-wrap gap-2">
              {watchlist.map(s => (
                <span key={s} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
