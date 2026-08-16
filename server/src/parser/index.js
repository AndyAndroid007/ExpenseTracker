import { extractAmount } from './amount.js';
import { extractCategory } from './categories.js';
import { parseExpenseDate } from './dates.js';
import logger from '../utils/logger.js';
import { extractUnmappedMerchant } from './merchant.js';
import { NO_SPEND_PATTERN, SAVE_DAY_PATTERN } from './patterns.js';

/**
 * Parses a raw conversational text string into structured entry fields.
 * 
 * @param {string} rawText - Normalized text
 * @param {number} timezoneOffsetMinutes - Timezone offset in minutes
 * @returns {object} Structured output containing amount, category, type, and dates
 */
export const parseMessage = (rawText, timezoneOffsetMinutes = 0) => {
    if (!rawText || typeof rawText !== 'string') {
        logger.error({ rawText }, 'Invalid or missing raw text input received in parser');
        throw new Error('Raw text is required for parsing');
    }

    logger.trace({ rawText, timezoneOffsetMinutes }, 'Local regex parsing triggered');
    const normalized = rawText.toLowerCase().trim();

    // 1. Detect Entry Type using robust word boundary regexes
    let type = 'expense';
    if (NO_SPEND_PATTERN.test(normalized) || SAVE_DAY_PATTERN.test(normalized)) {
        type = 'save_day';
    }
    logger.trace({ rawText, type }, 'Local resolver determined entry type');

    // 2. Extract Amount (only for expenses and savings)
    let amount = null;
    if (type === 'expense') {
        amount = extractAmount(normalized);
    }
    else if (type === 'save_day') {
        amount = NO_SPEND_PATTERN.test(normalized) ? null : (extractAmount(normalized));
    }
    logger.trace({ rawText, amount }, 'Local resolver extracted amount');

    // 3. Extract Category
    const category = extractCategory(normalized);
    logger.trace({ rawText, category }, 'Local resolver extracted category');

    const unmappedMerchant = extractUnmappedMerchant(normalized, category);

    // 4. Resolve Date & Explicitness
    const { date: expenseDate, explicit: isExplicitDate } = parseExpenseDate(normalized, timezoneOffsetMinutes);
    logger.trace({ rawText, expenseDate, isExplicitDate }, 'Local resolver resolved expense date');

    // 5. Determine Confidence Level
    // - HIGH: Direct button actions, or both amount and date are explicitly mentioned
    // - MEDIUM: Valid amount extracted but date defaulted to today
    // - LOW: Amount is missing entirely for an expense
    let confidenceLevel = 'low';
    if (type === 'save_day' && amount === null) {
        confidenceLevel = 'high';
    } else if (amount !== null) {
        if (!isExplicitDate && category === 'General') {
            confidenceLevel = 'low'; // 2+ missing fields (date and category) -> LOW Confidence
        } else {
            confidenceLevel = isExplicitDate ? 'high' : 'medium';
        }
    }

    const parsedOutput = {
        rawText,
        type,
        amount,
        category,
        unmappedMerchant,
        expenseDate,
        confidenceLevel
    };

    logger.debug({ rawText, parsedResult: parsedOutput }, 'Local regex parsing successfully completed');
    return parsedOutput;
};

export default parseMessage;

