// AI Insight analysis utilities
// Provides analyzeTrades(trades, thresholds) and defaultThresholds for configurability.

const num = (v) => (v === null || v === undefined || isNaN(v)) ? 0 : Number(v);

export const defaultThresholds = {
  winRateGood: 55,
  winRateWeak: 45,
  profitFactorGood: 1.5,
  profitFactorWeak: 1.2,
  overtradingTradesPerDay: 6,
  holdLossFactor: 1.2, // losing hold > holdLossFactor * winning hold
  avgRTarget: 1,
  avgRConcern: 0.8,
  drawdownHighPct: 0.5,
  drawdownMedPct: 0.3
};

function summaryDrawdownSeverity(maxDD, curve, thresholds) {
  if (!curve.length) return 'LOW';
  const peak = Math.max(...curve);
  if (peak <= 0) return 'LOW';
  const pct = maxDD / peak;
  if (pct > thresholds.drawdownHighPct) return 'HIGH';
  if (pct > thresholds.drawdownMedPct) return 'MED';
  return 'LOW';
}

function estimatePriority(suggestion) {
  if (/Risk|Drawdown/i.test(suggestion.title)) return 1;
  if (/Risk\/Reward|R multiple/i.test(suggestion.title)) return 2;
  if (/Overtrading/i.test(suggestion.title)) return 3;
  if (/Holding Time/i.test(suggestion.title)) return 4;
  if (/Entry Criteria/i.test(suggestion.title)) return 5;
  return 10;
}

export function analyzeTrades(trades, thresholds = defaultThresholds) {
  if (!Array.isArray(trades) || trades.length === 0) {
    return {
      empty: true,
      tradeTypeStats: { long: { count: 0, pnl: 0 }, short: { count: 0, pnl: 0 } },
      chargesSummary: { totalCharges: 0, avgCharges: 0, totalBrokerage: 0, avgBrokerage: 0 },
      winLossPie: [
        { name: 'Wins', value: 0 },
        { name: 'Losses', value: 0 },
        { name: 'Breakeven', value: 0 }
      ],
      tradeTypePie: [
        { name: 'Long', value: 0 },
        { name: 'Short', value: 0 }
      ],
      symbolPie: [],
      calendarHeatmap: {},
      recentTrades: [],
      strengths: [],
      weaknesses: [],
      suggestions: [],
      bestDay: null,
      worstDay: null,
      bestWeek: null,
      worstWeek: null,
      bestMonth: null,
      worstMonth: null,
      mostTradedSymbol: null,
      winStreak: 0,
      lossStreak: 0
    };
  }

  const norm = trades.map(t => ({
    status: t.status || (t.exitDate ? 'CLOSED' : 'OPEN'),
    profit: num(t.profitOrLoss ?? t.pnl),
    entryDate: t.entryDate ? new Date(t.entryDate) : null,
    exitDate: t.exitDate ? new Date(t.exitDate) : null,
    symbol: t.symbol || 'UNKNOWN',
    quantity: num(t.quantity),
    exitQuantity: num(t.exitQuantity),
    entryPrice: num(t.entryPrice),
    stopLoss: num(t.stopLoss),
    target: num(t.target),
    type: t.type || t.tradeType || '',
  }));

  const closed = norm.filter(t => t.status === 'CLOSED');
  const wins = closed.filter(t => t.profit > 0);
  const losses = closed.filter(t => t.profit < 0);
  const breakeven = closed.filter(t => t.profit === 0);
  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((a,b)=>a+b.profit,0)/wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((a,b)=>a+b.profit,0)/losses.length : 0; // negative
  const profitFactor = losses.length ? (wins.reduce((a,b)=>a+b.profit,0)/ Math.abs(losses.reduce((a,b)=>a+b.profit,0))) : (wins.length?Infinity:0);
  const expectancy = (winRate/100)*avgWin + (1 - winRate/100)*avgLoss;

  const avgHoldWin = wins.length ? wins.reduce((a,t)=> a + ((t.exitDate && t.entryDate)? (t.exitDate - t.entryDate)/(1000*60*60*24):0),0)/wins.length : 0;
  const avgHoldLoss = losses.length ? losses.reduce((a,t)=> a + ((t.exitDate && t.entryDate)? (t.exitDate - t.entryDate)/(1000*60*60*24):0),0)/losses.length : 0;

  let equity = 0; const equityCurve=[]; closed.sort((a,b)=> (a.exitDate||0) - (b.exitDate||0)).forEach(t=>{ equity += t.profit; equityCurve.push(equity);});
  let peak = -Infinity, maxDD = 0; equityCurve.forEach(v=> { if (v>peak) peak=v; const dd = peak - v; if (dd>maxDD) maxDD = dd; });

  const bySymbol = {};
  closed.forEach(t => { bySymbol[t.symbol] = (bySymbol[t.symbol]||0) + t.profit; });
  const bestSymbol = Object.entries(bySymbol).sort((a,b)=>b[1]-a[1])[0] || null;
  const worstSymbol = Object.entries(bySymbol).sort((a,b)=>a[1]-b[1])[0] || null;

  const hourPerf = {};
  closed.forEach(t => { if (t.entryDate){ const h = t.entryDate.getHours(); hourPerf[h] = (hourPerf[h]||0)+t.profit; }});
  const worstHour = Object.entries(hourPerf).sort((a,b)=>a[1]-b[1])[0] || null;
  const bestHour = Object.entries(hourPerf).sort((a,b)=>b[1]-a[1])[0] || null;

  const rList = closed.filter(t => t.stopLoss && t.entryPrice).map(t => {
    const riskPerUnit = Math.abs(t.entryPrice - t.stopLoss);
    if (!riskPerUnit) return null;
    const grossMove = t.profit / (t.quantity || 1);
    return grossMove / riskPerUnit;
  }).filter(Boolean);
  const avgR = rList.length ? rList.reduce((a,b)=>a+b,0)/rList.length : 0;

  const dayMap = {};
  closed.forEach(t=> { if(!t.entryDate) return; const d = t.entryDate.toISOString().slice(0,10); dayMap[d]=(dayMap[d]||0)+1;});
  const highFreqDays = Object.entries(dayMap).filter(([,c])=> c>=thresholds.overtradingTradesPerDay).length;

  const weaknesses = [];
  if (avgWin && avgLoss && Math.abs(avgLoss) > avgWin) weaknesses.push('Average losing trade larger than average winning trade.');
  if (winRate < thresholds.winRateWeak && profitFactor < thresholds.profitFactorWeak) weaknesses.push('Win rate and profit factor both below target.');
  if (avgHoldLoss > avgHoldWin * thresholds.holdLossFactor) weaknesses.push('Holding losers significantly longer than winners.');
  if (highFreqDays > 0) weaknesses.push('Potential overtrading detected (excess trades in a day).');
  if (avgR < thresholds.avgRConcern && rList.length > 5) weaknesses.push('Average R multiple below concern threshold.');
  if (maxDD > 0 && summaryDrawdownSeverity(maxDD, equityCurve, thresholds) === 'HIGH') weaknesses.push('High drawdown relative to peak equity.');
  if (worstHour && worstHour[1] < 0) weaknesses.push(`Negative performance during hour ${worstHour[0]}:00.`);

  const strengths = [];
  if (winRate >= thresholds.winRateGood) strengths.push('Win rate above target.');
  if (profitFactor >= thresholds.profitFactorGood && profitFactor !== Infinity) strengths.push('Healthy profit factor.');
  if (avgWin && avgLoss && avgWin > Math.abs(avgLoss)) strengths.push('Average win exceeds average loss.');
  if (avgHoldLoss < avgHoldWin) strengths.push('Cutting losers faster than winners.');
  if (avgR >= thresholds.avgRTarget) strengths.push('Average R multiple on target or higher.');
  if (bestSymbol && bestSymbol[1] > 0) strengths.push(`Strong symbol: ${bestSymbol[0]}.`);

  const suggestions = [];
  if (avgWin && avgLoss && Math.abs(avgLoss) > avgWin) suggestions.push({ title:'Balance Win/Loss Sizes', detail:'Tighten stops or extend profit targets so average win ≥ average loss.' });
  if (avgHoldLoss > avgHoldWin * thresholds.holdLossFactor) suggestions.push({ title:'Trim Loser Hold Time', detail:'Add time-based or pain-based stop to exit lagging trades sooner.' });
  if (avgR < thresholds.avgRTarget) suggestions.push({ title:'Increase R Setup Quality', detail:'Only take trades offering ≥1.2R initial potential.' });
  if (highFreqDays) suggestions.push({ title:'Mitigate Overtrading', detail:'Set a max trades per day or a cooldown after consecutive losses.' });
  if (worstHour && worstHour[1] < 0) suggestions.push({ title:'Avoid Weak Hour', detail:`Limit entries around ${worstHour[0]}:00 or require extra confirmation.` });
  if (profitFactor < thresholds.profitFactorWeak && winRate < thresholds.winRateWeak) suggestions.push({ title:'Refine Entry Filters', detail:'Stricter criteria / confluence to boost either win rate or RR.' });
  if (maxDD > 0 && summaryDrawdownSeverity(maxDD, equityCurve, thresholds) === 'HIGH') suggestions.push({ title:'Drawdown Control', detail:'Implement daily/weekly loss caps and reduce size after losing streaks.' });

  // --- Additional Insights ---
  // Best/Worst Day
  const dayPLMap = {};
  closed.forEach(t => {
    if (t.exitDate) {
      const d = t.exitDate.toISOString().slice(0,10);
      dayPLMap[d] = (dayPLMap[d]||0) + t.profit;
    }
  });
  const dayPLArr = Object.entries(dayPLMap).map(([date, pnl]) => ({ date, pnl }));
  const bestDay = dayPLArr.length ? dayPLArr.reduce((a,b)=> a.pnl > b.pnl ? a : b) : null;
  const worstDay = dayPLArr.length ? dayPLArr.reduce((a,b)=> a.pnl < b.pnl ? a : b) : null;

  // Best/Worst Week
  const weekPLMap = {};
  closed.forEach(t => {
    if (t.exitDate) {
      const d = t.exitDate;
      const week = `${d.getFullYear()}-W${Math.ceil((d.getDate() + ((d.getDay()+6)%7))/7)}`;
      weekPLMap[week] = (weekPLMap[week]||0) + t.profit;
    }
  });
  const weekPLArr = Object.entries(weekPLMap).map(([week, pnl]) => ({ week, pnl }));
  const bestWeek = weekPLArr.length ? weekPLArr.reduce((a,b)=> a.pnl > b.pnl ? a : b) : null;
  const worstWeek = weekPLArr.length ? weekPLArr.reduce((a,b)=> a.pnl < b.pnl ? a : b) : null;

  // Best/Worst Month
  const monthPLMap = {};
  closed.forEach(t => {
    if (t.exitDate) {
      const d = t.exitDate;
      const month = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      monthPLMap[month] = (monthPLMap[month]||0) + t.profit;
    }
  });
  const monthPLArr = Object.entries(monthPLMap).map(([month, pnl]) => ({ month, pnl }));
  const bestMonth = monthPLArr.length ? monthPLArr.reduce((a,b)=> a.pnl > b.pnl ? a : b) : null;
  const worstMonth = monthPLArr.length ? monthPLArr.reduce((a,b)=> a.pnl < b.pnl ? a : b) : null;

  // Most traded symbol
  const symbolCountMap = {};
  closed.forEach(t => { symbolCountMap[t.symbol] = (symbolCountMap[t.symbol]||0)+1; });
  const mostTradedSymbol = Object.entries(symbolCountMap).sort((a,b)=>b[1]-a[1])[0] || null;

  // Streaks
  let winStreak=0, maxWinStreak=0, lossStreak=0, maxLossStreak=0;
  closed.forEach(t => {
    if (t.profit > 0) {
      winStreak++;
      maxWinStreak = Math.max(maxWinStreak, winStreak);
      lossStreak=0;
    } else if (t.profit < 0) {
      lossStreak++;
      maxLossStreak = Math.max(maxLossStreak, lossStreak);
      winStreak=0;
    } else {
      winStreak=0; lossStreak=0;
    }
  });

  // Recent performance (last 5 closed trades)
  const recentTrades = closed.slice(-5).map(t => ({
    date: t.exitDate ? t.exitDate.toISOString().slice(0,16).replace('T',' ') : '',
    symbol: t.symbol,
    result: t.profit > 0 ? 'Win' : t.profit < 0 ? 'Loss' : 'Breakeven',
    pnl: t.profit
  })).reverse();

  // Trade type breakdown
  const tradeTypeStats = { long: { count:0, pnl:0 }, short: { count:0, pnl:0 } };
  closed.forEach(t => {
    if (t.type === 'BUY') { tradeTypeStats.long.count++; tradeTypeStats.long.pnl += t.profit; }
    else if (t.type === 'SELL') { tradeTypeStats.short.count++; tradeTypeStats.short.pnl += t.profit; }
  });

  // Charges/brokerage summary
  let totalCharges=0, totalBrokerage=0;
  closed.forEach(t => {
    totalCharges += num(t.totalCharges);
    totalBrokerage += num(t.brokerage);
  });
  const chargesSummary = {
    totalCharges,
    avgCharges: closed.length ? totalCharges/closed.length : 0,
    totalBrokerage,
    avgBrokerage: closed.length ? totalBrokerage/closed.length : 0
  };

  // Calendar heatmap (trades per day)
  const calendarHeatmap = dayMap; // {date: count}

  // Pie/bar chart data
  const winLossPie = [
    { name: 'Wins', value: wins.length },
    { name: 'Losses', value: losses.length },
    { name: 'Breakeven', value: breakeven.length }
  ];
  const tradeTypePie = [
    { name: 'Long', value: tradeTypeStats.long.count },
    { name: 'Short', value: tradeTypeStats.short.count }
  ];
  const symbolPie = Object.entries(symbolCountMap).map(([symbol, count]) => ({ symbol, count }));

  const improvements = suggestions.map(s => ({ ...s, priority: estimatePriority(s) })).sort((a,b)=> a.priority - b.priority);

  return {
    empty:false,
    stats: { winRate, avgWin, avgLoss, profitFactor, expectancy, avgHoldWin, avgHoldLoss, avgR, maxDD, closed: closed.length, wins: wins.length, losses: losses.length, breakeven: breakeven.length },
    strengths,
    weaknesses,
    suggestions: improvements,
    bestSymbol,
    worstSymbol,
    bestHour,
    worstHour,
    hourPerf,
    equityCurve,
    thresholds,
    bestDay,
    worstDay,
    bestWeek,
    worstWeek,
    bestMonth,
    worstMonth,
    mostTradedSymbol,
    winStreak: maxWinStreak,
    lossStreak: maxLossStreak,
    recentTrades,
    tradeTypeStats,
    chargesSummary,
    calendarHeatmap,
    winLossPie,
    tradeTypePie,
    symbolPie
  };
}

export default analyzeTrades;
