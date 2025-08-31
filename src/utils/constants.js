export const SYMBOL_TYPES = ["NSE", "BSE"];
export const TRADE_TYPES = ["BUY", "SELL"];
export const TRADE_STATUS = ["OPEN", "CLOSED", "CANCELED"];
export const TRADE_CATEGORIES = ["EQUITY", "FUTURES", "OPTIONS", "CURRENCY", "COMMODITY"];
export const TIME_FRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"];
export const ORDER_TYPES = ["MARKET", "LIMIT", "STOPLOSS", "TRAILING_STOPLOSS"];
export const ORDER_STATUS = ["PENDING", "EXECUTED", "CANCELED", "REJECTED"];
export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"];
export const ACCOUNT_TYPES = ["CASH", "MARGIN", "DERIVATIVES"];
export const STRATEGY_TYPES = ["SCALPING", "DAY_TRADING", "SWING_TRADING", "POSITION_TRADING", "ARBITRAGE"];
export const ANALYSIS_TYPES = ["TECHNICAL", "FUNDAMENTAL", "SENTIMENTAL", "QUANTITATIVE"];
export const PERFORMANCE_METRICS = ["WIN_RATE", "AVERAGE_PROFIT", "AVERAGE_LOSS", "MAX_DRAWDOWN", "SHARPE_RATIO", "SORTINO_RATIO"];
export const NOTIFICATION_TYPES = ["TRADE_EXECUTED", "TRADE_CLOSED", "PRICE_ALERT", "NEWS_ALERT", "SYSTEM_ALERT"];
export const MARKET_SEGMENTS = ["EQUITY", "FUTURES", "OPTIONS", "CURRENCY", "COMMODITY"];
export const TIME_ZONES = ["UTC", "IST", "EST", "CST", "PST"];
export const DATA_SOURCES = ["BROKER_API", "CSV_UPLOAD", "MANUAL_ENTRY", "DATABASE_SYNC"];
export const ANALYTICS_TOOLS = ["CHARTING", "STATISTICAL_ANALYSIS", "MACHINE_LEARNING", "DATA_VISUALIZATION"];
export const USER_ROLES = ["ADMIN", "TRADER", "ANALYST", "GUEST"];
export const AUTHENTICATION_METHODS = ["EMAIL_PASSWORD", "OAUTH", "SSO", "API_KEY"];
export const NOTIFICATION_PREFERENCES = ["EMAIL", "SMS", "PUSH_NOTIFICATION", "IN_APP"];
export const DATA_EXPORT_FORMATS = ["CSV", "XLSX", "PDF", "JSON"];
export const BACKUP_FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY"];
export const SECURITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const API_ACCESS_LEVELS = ["READ_ONLY", "READ_WRITE", "ADMIN"];
export const TRADE_PER_PAGE = 20;
export const SORT_ORDER = "ASC";

export const UI_THEMES = ["LIGHT", "DARK", "AUTO"];

export const TRADE_TABLE_COLUMNS = [
    { key: 'symbol', label: 'Symbol' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'entryDate', label: 'Entry Date' },
    { key: 'entryPrice', label: 'Entry Price' },
    { key: 'quantity', label: 'Orig Qty' },
    { key: 'openQuantity', label: 'Open Qty' },
    { key: 'stopLoss', label: 'Stop Loss' },
    { key: 'exitPrice', label: 'Exit Price' },
    { key: 'exitDate', label: 'Exit Date' },
    { key: 'profitOrLoss', label: 'NET PnL' },
    { key: 'action', label: '' }
];
