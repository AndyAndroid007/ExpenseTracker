import parseMessage from '../parser/index.js';
import fallbackParseWithLLM from './llm.js';
import { getLocalDateString } from '../parser/dates.js';
import logger from '../utils/logger.js';
import { checkLowConfidenceLimit } from '../middlewares/rateLimitMiddleware.js';
import { classifyIntentLocally, getBagOfWordsKey } from '../parser/intentClassifier.js';
import { getIntentMapping, createIntentMapping } from '../repositories/intentMapping.js';

/**
 * Orchestrates entry parsing by first running the local regex parser,
 * and falling back to a structured LLM call if confidence is low.
 * 
 * @param {string} userId - Auth user ID
 * @param {string} rawText - What the user typed
 * @param {number} timezoneOffsetMinutes - Timezone offset in minutes
 * @returns {Promise<object>} Final parsing result (guaranteed to return a valid object)
 */
export const parseEntry = async (userId, rawText, timezoneOffsetMinutes = 0, ianaTimezone = null) => {
    // 1. Check local classifier for chitchat/query patterns first
    const localIntent = classifyIntentLocally(rawText);
    if (localIntent) {
        logger.info({ rawText, localIntent }, 'Deterministic local classifier matched intent');
        return {
            rawText,
            intent: localIntent,
            type: 'expense',
            amount: null,
            category: 'General',
            expenseDate: getLocalDateString(timezoneOffsetMinutes, 0),
            confidenceLevel: 'high'
        };
    }

    // 2. Compute cache key and check DB intent cache
    const bowKey = getBagOfWordsKey(rawText);
    if (bowKey) {
        try {
            const cached = await getIntentMapping(bowKey);
            if (cached) {
                logger.info({ rawText, bowKey, cachedIntent: cached.intent }, 'Intent cache hit');
                
                // If it is a query or chitchat, bypass parsing entirely
                if (cached.intent === 'query' || cached.intent === 'chitchat') {
                    return {
                        rawText,
                        intent: cached.intent,
                        type: 'expense',
                        amount: null,
                        category: 'General',
                        expenseDate: getLocalDateString(timezoneOffsetMinutes, 0),
                        confidenceLevel: 'high'
                    };
                }
            }
        } catch (dbError) {
            logger.error({ dbError, rawText }, 'Failed to read from intent cache database');
        }
    }

    // 3. Run the local regex parser (only for logging expenses/save days)
    const regexResult = parseMessage(rawText, timezoneOffsetMinutes);
    regexResult.intent = 'log_expense'; // Local Regex Parsing is only for logging expenses
    logger.debug({ regexResult, rawText }, 'Local regex parsing complete');

    let parsed = regexResult;

    // 4. If local confidence is low, check rate limits before attempting an LLM correction fallback
    if (regexResult.confidenceLevel === 'low') {
        const greetingOrChitchat = /^(hi|hey|hello|sup|wassup|whatsup|yo|thanks|ty|lol|haha)\b/i;
        const hasNumber = /\d/.test(rawText);
        if (greetingOrChitchat.test(rawText) && !hasNumber) {
            logger.info({ rawText }, 'Greeting or chitchat detected by pre-filter. Skipping LLM.');
            parsed = {
                rawText,
                intent: 'other',
                type: 'expense',
                amount: null,
                category: 'General',
                expenseDate: getLocalDateString(timezoneOffsetMinutes, 0),
                confidenceLevel: 'high'
            };
        } else {
            // Check daily limit of low confidence LLM fallback attempts
            const isAllowed = await checkLowConfidenceLimit(userId);
            if (!isAllowed) {
                logger.warn({ userId, rawText }, 'Daily low-confidence log fallback limit exceeded. Blocking LLM fallback.');
                return {
                    rawText,
                    intent: 'low_confidence_blocked',
                    type: 'expense',
                    amount: null,
                    category: 'General',
                    expenseDate: getLocalDateString(timezoneOffsetMinutes, 0),
                    confidenceLevel: 'low'
                };
            }

            logger.info({ rawText }, 'Low local confidence detected. Routing to Gemini LLM fallback service.');
            const localDateContext = getLocalDateString(timezoneOffsetMinutes, 0);
            
            try {
                const llmResult = await fallbackParseWithLLM(rawText, regexResult, localDateContext, ianaTimezone);
                
                // If the LLM successfully resolved and structured the text, return it
                if (llmResult) {
                    parsed = llmResult;

                    // Cache the newly resolved intent in the database cache
                    if (bowKey && parsed.intent) {
                        try {
                            await createIntentMapping(bowKey, parsed.intent);
                            logger.info({ bowKey, intent: parsed.intent }, 'Successfully cached resolved intent in database');
                        } catch (cacheWriteError) {
                            logger.error({ cacheWriteError, bowKey }, 'Failed to write resolved intent to cache database');
                        }
                    }
                }
            } catch (error) {
                logger.error({ error, rawText }, 'Error during LLM orchestrator fallback execution');
            }
        }
    }

    // 5. Mark future logs
    const localToday = getLocalDateString(timezoneOffsetMinutes, 0);
    if (parsed.expenseDate > localToday) {
        parsed.isFuture = true;
    }

    return parsed;
};

export default parseEntry;
