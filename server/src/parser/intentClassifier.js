import { GREETING_PATTERN, QUERY_PATTERN, INTENT_STOP_WORDS } from './patterns.js';

/**
 * Classify intent locally and deterministically based on keyword and punctuation patterns.
 * @param {string} rawText 
 * @returns {string|null} 'chitchat' | 'query' | null
 */
export const classifyIntentLocally = (rawText) => {
    if (!rawText) return null;
    const trimmed = rawText.trim();

    // Check query pattern or ends with question mark
    if (trimmed.endsWith('?') || QUERY_PATTERN.test(trimmed)) {
        return 'query';
    }

    // Check greeting/chitchat pattern
    if (GREETING_PATTERN.test(trimmed)) {
        return 'chitchat';
    }

    return null;
};

/**
 * Generate a sorted Bag-of-Words cache key from input text.
 * Strips punctuation, filters out common stop words, sorts alphabetically, and joins with spaces.
 * @param {string} rawText 
 * @returns {string} Normalized Bag-of-Words key
 */
export const getBagOfWordsKey = (rawText) => {
    if (!rawText) return '';

    const normalized = rawText.toLowerCase().trim();

    // Clean punctuation and split into words
    const words = normalized
        .replace(/[^a-z0-9\s_-]/g, ' ')
        .split(/\s+/)
        .filter(w => w && !INTENT_STOP_WORDS.has(w));

    // Sort tokens alphabetically to ensure word order doesn't affect cache keys
    words.sort();

    return words.join(' ');
};
