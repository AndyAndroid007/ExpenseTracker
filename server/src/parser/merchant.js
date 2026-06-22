import { CATEGORY_KEYWORDS } from './categories.js';

// Common English words, prepositions, and transaction verbs to filter out
const STOP_WORDS = new Set([
    'spent', 'spent on', 'spent for', 'paid', 'paid to', 'paid for', 
    'bought', 'buy', 'purchase', 'on', 'at', 'to', 'for', 'the', 'a', 
    'in', 'of', 'with', 'by', 'from', 'today', 'yesterday', 'tomorrow',
    'rs', 'rs.', 'rupees', 'inr', 'bucks', 'amount', 'expense', 'money',
    'around', 'about', 'onwards', 'roughly', 'approx', 'approximately'
]);

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
    const filtered = words.filter(word => !STOP_WORDS.has(word) && !allKeywords.has(word));

    return filtered.length > 0 ? filtered[0] : null;
};
