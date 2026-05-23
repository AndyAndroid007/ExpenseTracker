/**
 * Resolves number formatting (commas vs periods) dynamically.
 * Handles standard (1,250.50) and European (1.250,50) formatting.
 * 
 * @param {string} numStr - The parsed number string
 * @returns {string} Cleaned decimal-compatible number string
 */
export const cleanNumberString = (numStr) => {
    const hasComma = numStr.includes(',');
    const hasDot = numStr.includes('.');

    if (hasComma && hasDot) {
        // Both exist. The last one is the decimal separator.
        if (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
            // e.g. 1.250,50 -> 1250.50
            return numStr.replace(/\./g, '').replace(/,/g, '.');
        } else {
            // e.g. 1,250.50 -> 1250.50
            return numStr.replace(/,/g, '');
        }
    } else if (hasComma) {
        // Only comma exists. If followed by exactly 2 digits (e.g. "150,50"), treat as decimal.
        const parts = numStr.split(',');
        if (parts[parts.length - 1].length === 2) {
            return numStr.replace(/,/g, '.');
        } else {
            // Otherwise treat as thousands separator (e.g. "1,000" -> "1000")
            return numStr.replace(/,/g, '');
        }
    }
    return numStr;
};
