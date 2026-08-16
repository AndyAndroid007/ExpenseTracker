import { cleanNumberString } from './helpers.js';
import { AMOUNT_REGEX } from './patterns.js';

/**
 * Extracts the first valid numeric amount from conversational text.
 * 
 * @param {string} text - Normalized raw text
 * @returns {number|null} The parsed amount or null
 */
export const extractAmount = (text) => {
    AMOUNT_REGEX.lastIndex = 0;
    
    let match;
    const candidates = [];
    
    while ((match = AMOUNT_REGEX.exec(text)) !== null) {
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
