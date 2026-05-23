import { cleanNumberString } from './helpers.js';

/**
 * Extracts the first valid numeric amount from conversational text.
 * 
 * @param {string} text - Normalized raw text
 * @returns {number|null} The parsed amount or null
 */
export const extractAmount = (text) => {
    // Matches digits with potential dots and commas, with optional currency prefixes or suffixes
    const amountRegex = /(?:₹|\$|€|£|rs\.?|inr|usd|eur|bucks)?\s*(\d+(?:[\.,]\d+)*)\s*(?:rs\.?|inr|usd|eur|bucks)?/gi;
    
    let match;
    const candidates = [];
    
    while ((match = amountRegex.exec(text)) !== null) {
        const numStr = match[1];
        const parsed = parseFloat(cleanNumberString(numStr));
        if (!isNaN(parsed)) {
            candidates.push(parsed);
        }
    }

    return candidates.length > 0 ? candidates[0] : null;
};
