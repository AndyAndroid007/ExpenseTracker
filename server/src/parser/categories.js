import { CATEGORY_KEYWORDS } from './patterns.js';
export { CATEGORY_KEYWORDS };


/**
 * Extracts and maps a category from conversational text based on keywords.
 * 
 * @param {string} text - Normalized raw text
 * @returns {string} The matched category, or "General" as a fallback
 */
export const extractCategory = (text) => {
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(text)) {
                return category;
            }
        }
    }
    return 'General';
};
