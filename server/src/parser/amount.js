import { cleanNumberString } from './helpers.js';

/**
 * Extracts the first valid numeric amount from conversational text.
 * 
 * @param {string} text - Normalized raw text
 * @returns {number|null} The parsed amount or null
 */
export const extractAmount = (text) => {
    // Matches digits with potential dots and commas, with optional currency prefixes or suffixes, optionally followed by 'k', 'kilo', 'grand', or 'grands'
    const amountRegex = /(?:₹|\$|€|£|rs\.?|inr|usd|eur|bucks)?\s*(\d+(?:[\.,]\d+)*)\s*(k|kilo|grand|grands)?\s*(?:rs\.?|inr|usd|eur|bucks)?/gi;
    
    let match;
    const candidates = [];
    
    while ((match = amountRegex.exec(text)) !== null) {
        const numStr = match[1];
        const hasK = match[2] && (match[2].toLowerCase().startsWith('k') || match[2].toLowerCase().startsWith('g'));
        let parsed = parseFloat(cleanNumberString(numStr));
        if (!isNaN(parsed)) {
            if (hasK) {
                parsed = parsed * 1000;
            }
            candidates.push(parsed);
        }
    }

    return candidates.length > 0 ? candidates[0] : null;
};
