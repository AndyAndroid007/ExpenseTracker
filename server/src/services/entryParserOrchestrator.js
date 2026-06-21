import parseMessage from '../parser/index.js';
import fallbackParseWithLLM from './llm.js';
import { getLocalDateString } from '../parser/dates.js';
import logger from '../utils/logger.js';

/**
 * Orchestrates entry parsing by first running the local regex parser,
 * and falling back to a structured LLM call if confidence is low.
 * 
 * @param {string} rawText - What the user typed
 * @param {number} timezoneOffsetMinutes - Timezone offset in minutes
 * @returns {Promise<object>} Final parsing result (guaranteed to return a valid object)
 */
export const parseEntry = async (rawText, timezoneOffsetMinutes = 0, ianaTimezone = null) => {
    // 1. First run the ultra-fast, local regex parser
    const regexResult = parseMessage(rawText, timezoneOffsetMinutes);
    regexResult.intent = 'log_expense'; //Local Regex Parsing is only for logging expenses
    logger.debug({ regexResult, rawText }, 'Local regex parsing complete');

    // 2. If local confidence is low, attempt an LLM correction fallback
    if (regexResult.confidenceLevel === 'low') {
        const greetingOrChitchat = /^(hi|hey|hello|sup|wassup|whatsup|yo|thanks|ty|lol|haha)\b/i;
        const hasNumber = /\d/.test(rawText);
        if (greetingOrChitchat.test(rawText) && !hasNumber) {
            logger.info({ rawText }, 'Greeting or chitchat detected by pre-filter. Skipping LLM.');
            return {
                rawText,
                intent: 'other',
                type: 'expense',
                amount: null,
                category: 'General',
                expenseDate: getLocalDateString(timezoneOffsetMinutes, 0),
                confidenceLevel: 'high'
            };
        }

        logger.info({ rawText }, 'Low local confidence detected. Routing to Gemini LLM fallback service.');
        const localDateContext = getLocalDateString(timezoneOffsetMinutes, 0);
        
        try {
            const llmResult = await fallbackParseWithLLM(rawText, regexResult, localDateContext, ianaTimezone);
            
            // If the LLM successfully resolved and structured the text, return it
            if (llmResult) {
                return llmResult;
            }
        } catch (error) {
            logger.error({ error, rawText }, 'Error during LLM orchestrator fallback execution');
        }
    }

    // 3. Fallback to regex result if confidence is high/medium or the LLM failed
    return regexResult;
};

export default parseEntry;
