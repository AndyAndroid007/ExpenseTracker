import { CATEGORY_KEYWORDS } from './categories.js';
import { MERCHANT_STOP_WORDS } from './patterns.js';

/**
 * Extracts candidate merchant name if category is 'General'
 * @param {string} rawText - What the user typed
 * @param {string} category - Resolved category
 * @returns {string|null} Candidate merchant name, or null
 */
export const extractUnmappedMerchant = (rawText, category) => {
    if (!rawText || category !== 'General') return null;

    const normalized = rawText.toLowerCase().trim();
    
    // Split and clean text
    const words = normalized
        .replace(/[^a-z0-9\s_-]/g, '')
        .split(/\s+/)
        .filter(w => w && isNaN(w));

    // Gather all category keywords for filtering
    const allKeywords = new Set();
    for (const keywords of Object.values(CATEGORY_KEYWORDS)) {
        for (const kw of keywords) {
            allKeywords.add(kw.toLowerCase());
        }
    }

    // Filter out stopwords and known category keywords
    const filtered = words.filter(word => !MERCHANT_STOP_WORDS.has(word) && !allKeywords.has(word));

    return filtered.length > 0 ? filtered.join(' ') : null;
};
