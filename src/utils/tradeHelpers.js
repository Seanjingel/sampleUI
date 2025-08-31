// export function filterTrades(trades, searchQuery, dateRange) {
//     let filtered = trades;
//     // Filter by date range if both start and end are provided
//     if (dateRange && dateRange.start && dateRange.end) {
//         const startDate = new Date(dateRange.start);
//         const endDate = new Date(dateRange.end);
//         filtered = filtered.filter(trade => {
//             const entryDate = trade.entryDate ? new Date(trade.entryDate) : null;
//             return entryDate && entryDate >= startDate && entryDate <= endDate;
//         });
//     }
//     // Filter by search query
//     if (searchQuery) {
//         filtered = filtered.filter(trade =>
//             trade.symbol && trade.symbol.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//     }
//     return filtered;
// }

export function sortTrades(trades, sortKey, sortOrder) {
    if (!sortKey) return trades;
    return [...trades].sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        // Special handling for entryDate
        if (sortKey === 'entryDate') {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        }
        // Always compare strings with localeCompare
        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        // For numbers and dates
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        // Fallback for other types
        if (sortOrder === 'asc' || sortOrder === 'ASC') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });
}

// export function formatDate(dateStr) {
//     if (!dateStr) return '';
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
// }

/**
 * Format a number as currency with $ symbol
 * @param {number|string} value - The value to format
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = '$') {
    if (value === undefined || value === null) return '--';
    
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it's a valid number
    if (isNaN(numValue)) return '--';
    
    // Format with 2 decimal places and add currency symbol
    return `${currency}${Math.abs(numValue).toFixed(2)}`;
}

/**
 * Format a number as percentage
 * @param {number|string} value - The value to format as percentage
 * @returns {string} Formatted percentage string
 */
// export function formatPercentage(value) {
//     if (value === undefined || value === null) return '--';
//    
//     // Convert to number if it's a string
//     const numValue = typeof value === 'string' ? parseFloat(value) : value;
//    
//     // Check if it's a valid number
//     if (isNaN(numValue)) return '--';
//    
//     // Format with 2 decimal places and add percentage symbol
//     return `${numValue.toFixed(2)}%`;
// }
