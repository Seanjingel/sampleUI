import React, { useEffect, useState, useMemo } from 'react';
import { getAllTrades } from '../api/tradeService';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Lightbulb, RefreshCw, Download, Settings2, X } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { analyzeTrades, defaultThresholds } from '../utils/aiInsight';

// localStorage key for thresholds
const TH_KEY = 'aiInsight.thresholds';
const loadThresholds = () => { try { const raw = localStorage.getItem(TH_KEY); if (raw) return { ...defaultThresholds, ...JSON.parse(raw)}; } catch(_) {} return { ...defaultThresholds }; };
const saveThresholds = (t) => { try { localStorage.setItem(TH_KEY, JSON.stringify(t)); } catch(_) {} };

// Badge component
const Badge = ({ children, kind='neutral' }) => {
  const map = {
    success:'bg-green-100 text-green-700',
    danger:'bg-red-100 text-red-700',
    warn:'bg-yellow-100 text-yellow-700',
    info:'bg-blue-100 text-blue-700',
    neutral:'bg-gray-100 text-gray-700'
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[kind]||map.neutral}`}>{children}</span>;
};

// Stat component
const Stat = ({ label, value, highlight }) => (
  <div className="p-3 rounded-lg bg-white border shadow-sm">
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className={`text-lg font-semibold ${highlight||''}`}>{value}</p>
  </div>
);

// Main AIInsight component
const AIInsight = () => {
   const [trades, setTrades] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [refreshKey, setRefreshKey] = useState(0);
   const [thresholds, setThresholds] = useState(loadThresholds);
   const [showSettings, setShowSettings] = useState(false);

   // Fetch trades data
   useEffect(() => {
     let active = true;
     (async () => {
       setLoading(true); setError(null);
       try {
         const res = await getAllTrades();
         const possible = [res?.data?.data, res?.data, res?.trades, res?.results, Array.isArray(res)?res:null];
         let arr = [];
         for (const c of possible) { if (Array.isArray(c)) { arr = c; break; } }
         if (active) setTrades(arr);
       } catch (e) {
         if (active) setError('Failed to load trades');
       } finally { if (active) setLoading(false); }
     })();
     return () => { active = false; };
   }, [refreshKey]);

   // Analyze trades data
   const insight = useMemo(()=> analyzeTrades(trades, thresholds), [trades, thresholds]);

   // Update threshold field
   const updateThresholdField = (key, value) => {
     setThresholds(t => { const nt = { ...t, [key]: value }; saveThresholds(nt); return nt; });
   };

   // Export data as JSON
   const exportJSON = () => {
     const blob = new Blob([JSON.stringify({ generatedAt: new Date().toISOString(), insight }, null, 2)], { type:'application/json'});
     const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='ai_insight.json'; a.click(); URL.revokeObjectURL(url);
   };
   // Export data as text
   const exportText = () => {
     const lines = [];
     lines.push('AI Insight Summary');
     lines.push(`Generated: ${new Date().toLocaleString()}`);
     if (insight.empty) { lines.push('No data'); } else {
       lines.push(`WinRate: ${insight.stats.winRate.toFixed(1)}% ProfitFactor: ${insight.stats.profitFactor.toFixed(2)} Expectancy: ${insight.stats.expectancy.toFixed(2)}`);
       lines.push('Strengths:'); insight.strengths.forEach(s=>lines.push(' + '+s));
       lines.push('Weaknesses:'); insight.weaknesses.forEach(w=>lines.push(' - '+w));
       lines.push('Top Suggestions:'); insight.suggestions.slice(0,5).forEach((s,i)=>lines.push(`${i+1}. ${s.title} - ${s.detail}`));
     }
     const blob = new Blob([lines.join('\n')], { type:'text/plain'});
     const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='ai_insight.txt'; a.click(); URL.revokeObjectURL(url);
   };

   const hourPerfArray = useMemo(()=> {
     if (insight.empty) return [];
     return Array.from({length:24}).map((_,h)=>({ hour:h, pnl: insight.hourPerf?.[h]||0 }));
   }, [insight]);

   return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-600"/> AI Insight Overview</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={()=> setRefreshKey(k=>k+1)} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"><RefreshCw className="h-4 w-4"/> Refresh</button>
          {!insight.empty && <>
            <button onClick={exportJSON} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"><Download className="h-4 w-4"/> JSON</button>
            <button onClick={exportText} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"><Download className="h-4 w-4"/> Text</button>
          </>
          }
          <button onClick={()=> setShowSettings(s=>!s)} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"><Settings2 className="h-4 w-4"/> Thresholds</button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-white border rounded p-4 space-y-3 relative">
          <button onClick={()=>setShowSettings(false)} className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"><X className="h-4 w-4"/></button>
          <h2 className="font-semibold text-sm mb-2">Configuration Thresholds</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {Object.entries(thresholds).map(([k,v])=> (
              <label key={k} className="flex flex-col gap-1">
                <span className="uppercase tracking-wide text-gray-500">{k}</span>
                <input type="number" step="0.01" value={v} onChange={(e)=> updateThresholdField(k, Number(e.target.value))} className="border rounded px-2 py-1 text-sm" />
              </label>
            ))}
          </div>
          <p className="text-[11px] text-gray-500">Edits persist locally and recalc insights instantly.</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse" aria-busy="true">
          {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-20 bg-white border rounded-lg"/>))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}

      {!loading && insight.empty && (
        <div className="bg-white p-8 rounded border text-center space-y-4">
          <Lightbulb className="h-10 w-10 text-emerald-600 mx-auto"/>
          <p className="text-gray-600">Add some trades to unlock personalized performance insights and improvement suggestions.</p>
        </div>
      )}

      {!loading && !insight.empty && (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <Stat label="Win Rate" value={`${insight.stats.winRate.toFixed(1)}%`} highlight={insight.stats.winRate>=55?'text-green-600': insight.stats.winRate<45?'text-red-600':''} />
            <Stat label="Profit Factor" value={insight.stats.profitFactor===Infinity?'∞': insight.stats.profitFactor.toFixed(2)} highlight={insight.stats.profitFactor>=1.5?'text-green-600': insight.stats.profitFactor<1?'text-red-600':''} />
            <Stat label="Expectancy" value={`${insight.stats.expectancy>=0?'+':''}₹${insight.stats.expectancy.toFixed(2)}`} highlight={insight.stats.expectancy>=0?'text-green-600':'text-red-600'} />
            <Stat label="Avg Win" value={`₹${insight.stats.avgWin.toFixed(2)}`} />
            <Stat label="Avg Loss" value={`₹${insight.stats.avgLoss.toFixed(2)}`} highlight={Math.abs(insight.stats.avgLoss)>insight.stats.avgWin?'text-red-600':''} />
            <Stat label="Avg R" value={insight.stats.avgR.toFixed(2)} />
            <div className="p-3 rounded-lg bg-white border shadow-sm flex flex-col justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Equity</p>
              <div className="h-10 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insight.equityCurve.map((v,i)=>({i,v}))}>
                    <Tooltip formatter={(val)=>[`₹${Number(val).toFixed(2)}`,'Equity']} />
                    <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
           </div>
          {/* Hour heatmap */}
          <div className="bg-white rounded-lg border p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2 text-gray-800"><Activity className="h-4 w-4"/> Hourly Performance Heatmap</h2>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 text-[10px]">
              {hourPerfArray.map(h => {
                const pnl = h.pnl; const cls = pnl>0?'bg-green-100 text-green-700': pnl<0?'bg-red-100 text-red-700':'bg-gray-100 text-gray-500';
                return <div key={h.hour} className={`rounded p-1 flex flex-col items-center ${cls}`} title={`Hour ${h.hour}:00 P&L ₹${pnl.toFixed(2)}`}> <span>{h.hour}</span><span className="font-medium">{pnl>0?'+':pnl<0?'-':'='}</span></div>;})}
            </div>
            <p className="text-[11px] text-gray-500">Sign indicates direction; hover for exact P&L.</p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-5 space-y-3">
              <h2 className="font-semibold flex items-center gap-2 text-green-700"><TrendingUp className="h-4 w-4"/> Strengths</h2>
              {insight.strengths.length ? insight.strengths.map((s,i)=>(<p key={i} className="text-sm text-gray-700 flex gap-2"><Badge kind='success'>+ </Badge>{s}</p>)) : <p className="text-sm text-gray-500">No major strengths identified yet.</p>}
            </div>
            <div className="bg-white rounded-lg border p-5 space-y-3">
              <h2 className="font-semibold flex items-center gap-2 text-red-700"><TrendingDown className="h-4 w-4"/> Weaknesses</h2>
              {insight.weaknesses.length ? insight.weaknesses.map((w,i)=>(<p key={i} className="text-sm text-gray-700 flex gap-2"><Badge kind='danger'>! </Badge>{w}</p>)) : <p className="text-sm text-gray-500">No critical weaknesses detected.</p>}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-lg border p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2 text-amber-600"><Lightbulb className="h-4 w-4"/> Actionable Suggestions</h2>
            {insight.suggestions.length ? (
              <ol className="space-y-3 list-decimal list-inside">
                {insight.suggestions.map((s,i)=>(
                  <li key={i} className="pl-1">
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-2"><Badge kind={i<3?'warn':'info'}>P{i+1}</Badge>{s.title}</p>
                    <p className="text-xs text-gray-600 ml-6 mt-1">{s.detail}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="text-sm text-gray-500">No suggestions at this time.</p>}
          </div>

          {/* Symbol & Time Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Activity className="h-4 w-4"/> Symbol Performance</h3>
              <div className="text-sm space-y-2">
                {insight.bestSymbol && <p>Best: <Badge kind='success'>{insight.bestSymbol[0]}</Badge> ₹{insight.bestSymbol[1].toFixed(2)}</p>}
                {insight.worstSymbol && <p>Worst: <Badge kind='danger'>{insight.worstSymbol[0]}</Badge> ₹{insight.worstSymbol[1].toFixed(2)}</p>}
                {!insight.bestSymbol && <p className="text-gray-500">Not enough symbol data.</p>}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> Time-of-Day</h3>
              <div className="text-sm space-y-2">
                {insight.bestHour && <p>Best Hour: <Badge kind='success'>{insight.bestHour[0]}:00</Badge> ₹{insight.bestHour[1].toFixed(2)}</p>}
                {insight.worstHour && <p>Worst Hour: <Badge kind='danger'>{insight.worstHour[0]}:00</Badge> ₹{insight.worstHour[1].toFixed(2)}</p>}
                {!insight.bestHour && <p className="text-gray-500">Not enough intraday data.</p>}
              </div>
            </div>
          </div>

          {/* Equity & Drawdown Summary */}
          <div className="bg-white rounded-lg border p-5 space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Activity className="h-4 w-4"/> Risk & Drawdown</h3>
            <p className="text-sm text-gray-700">Max Drawdown: <span className="font-semibold">₹{insight.stats.maxDD.toFixed(2)}</span></p>
            <p className="text-xs text-gray-500">(Equity-based, sequential closed trades)</p>
            <p className="text-xs text-gray-500">Drawdown Severity: {insight.stats.maxDD === 0 ? 'NONE' : insight.equityCurve.length ? 'See equity trend for context' : 'N/A'}</p>
           </div>

          {/* --- Enhanced Overview Insights --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best/Worst Day/Week/Month */}
            <div className="bg-white rounded-lg border p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Lightbulb className="h-4 w-4"/> Best & Worst Periods</h3>
              <div className="text-sm space-y-1">
                {insight.bestDay && <p>Best Day: <Badge kind='success'>{insight.bestDay.date}</Badge> ₹{insight.bestDay.pnl.toFixed(2)}</p>}
                {insight.worstDay && <p>Worst Day: <Badge kind='danger'>{insight.worstDay.date}</Badge> ₹{insight.worstDay.pnl.toFixed(2)}</p>}
                {insight.bestWeek && <p>Best Week: <Badge kind='success'>{insight.bestWeek.week}</Badge> ₹{insight.bestWeek.pnl.toFixed(2)}</p>}
                {insight.worstWeek && <p>Worst Week: <Badge kind='danger'>{insight.worstWeek.week}</Badge> ₹{insight.worstWeek.pnl.toFixed(2)}</p>}
                {insight.bestMonth && <p>Best Month: <Badge kind='success'>{insight.bestMonth.month}</Badge> ₹{insight.bestMonth.pnl.toFixed(2)}</p>}
                {insight.worstMonth && <p>Worst Month: <Badge kind='danger'>{insight.worstMonth.month}</Badge> ₹{insight.worstMonth.pnl.toFixed(2)}</p>}
              </div>
            </div>
            {/* Most Traded Symbol & Streaks */}
            <div className="bg-white rounded-lg border p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Activity className="h-4 w-4"/> Symbol & Streaks</h3>
              <div className="text-sm space-y-1">
                {insight.mostTradedSymbol && <p>Most Traded: <Badge kind='info'>{insight.mostTradedSymbol[0]}</Badge> ({insight.mostTradedSymbol[1]} trades)</p>}
                <p>Max Win Streak: <Badge kind='success'>{insight.winStreak}</Badge></p>
                <p>Max Loss Streak: <Badge kind='danger'>{insight.lossStreak}</Badge></p>
              </div>
            </div>
          </div>
          {/* Recent Trades */}
          <div className="bg-white rounded-lg border p-5 space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><TrendingUp className="h-4 w-4"/> Recent Trades</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              {insight.recentTrades.map((t,i)=>(
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
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Activity className="h-4 w-4"/> Trade Type Breakdown</h3>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1"><Badge kind='info'>Long</Badge> {insight.tradeTypeStats.long.count} trades, ₹{insight.tradeTypeStats.long.pnl.toFixed(2)}</span>
                <span className="flex items-center gap-1"><Badge kind='warn'>Short</Badge> {insight.tradeTypeStats.short.count} trades, ₹{insight.tradeTypeStats.short.pnl.toFixed(2)}</span>
              </div>
              <div className="mt-2">
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={insight.tradeTypePie}>
                    <Tooltip formatter={(val, name)=>[val, name]} />
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Activity className="h-4 w-4"/> Charges & Brokerage</h3>
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
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Activity className="h-4 w-4"/> Win/Loss Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={insight.winLossPie}>
                  <Tooltip formatter={(val, name)=>[val, name]} />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-lg border p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Activity className="h-4 w-4"/> Symbol Distribution</h3>
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
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Activity className="h-4 w-4"/> Trade Calendar Heatmap</h3>
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
        </>
      )}
    </div>
  );
};

export default AIInsight;
