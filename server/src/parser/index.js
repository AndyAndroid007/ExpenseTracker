import { extractAmount } from './amount.js';
import { extractCategory } from './categories.js';
import { parseExpenseDate } from './dates.js';
import logger from '../utils/logger.js';

/**
 * Main parser entry point.
 * Normalizes raw text and parses it into structured fields.
 * 
 * @param {string} rawText - User message e.g. "Swiggy 250 yesterday"
 * @param {number} timezoneOffsetMinutes - Offset in minutes (e.g. -330 for IST)
 * @returns {object} Final structured parsed entry details
 */
export const parseMessage = (rawText, timezoneOffsetMinutes = 0) => {
    if (!rawText || typeof rawText !== 'string') {
        logger.error({ rawText }, 'Invalid or missing raw text input received in parser');
        throw new Error('Raw text is required for parsing');
    }

    logger.trace({ rawText, timezoneOffsetMinutes }, 'Local regex parsing triggered');
    const normalized = rawText.toLowerCase().trim();

    // 1. Detect Entry Type using robust word boundary regexes
    const noSpendPattern = /\b(?:no|zero|0|did\s+not|didn'?t)\s+spend(?:ing)?\b/i;
    const saveDayPattern = /\b(?:saved?|save-day|save_day|saved?\s+(?:money|today))\b/i;

    let type = 'expense';
    if (noSpendPattern.test(normalized)) {
        type = 'no_spend';
    } else if (saveDayPattern.test(normalized)) {
        type = 'save_day';
    }
    logger.trace({ rawText, type }, 'Local resolver determined entry type');

    // 2. Extract Amount (only for expenses and savings)
    const amount = (type === 'expense' || type === 'save_day') ? extractAmount(normalized) : null;
    logger.trace({ rawText, amount }, 'Local resolver extracted amount');

    // 3. Extract Category
    const category = extractCategory(normalized);
    logger.trace({ rawText, category }, 'Local resolver extracted category');

    // 4. Resolve Date & Explicitness
    const { date: expenseDate, explicit: isExplicitDate } = parseExpenseDate(normalized, timezoneOffsetMinutes);
    logger.trace({ rawText, expenseDate, isExplicitDate }, 'Local resolver resolved expense date');

    // 5. Determine Confidence Level
    // - HIGH: Direct button actions, or both amount and date are explicitly mentioned
    // - MEDIUM: Valid amount extracted but date defaulted to today
    // - LOW: Amount is missing entirely for an expense
    let confidenceLevel = 'low';
    if (type === 'no_spend' || (type === 'save_day' && amount === null)) {
        confidenceLevel = 'high';
    } else if (amount !== null) {
        confidenceLevel = isExplicitDate ? 'high' : 'medium';
    }
    
    const parsedOutput = {
        rawText,
        type,
        amount,
        category,
        expenseDate,
        confidenceLevel
    };

    logger.debug({ rawText, parsedResult: parsedOutput }, 'Local regex parsing successfully completed');
    return parsedOutput;
};

export default parseMessage;

