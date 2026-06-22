import * as entriesRepository from '../repositories/entries.js'
import * as usersRepository from '../repositories/users.js'
import * as chatRepository from '../repositories/chat.js'
import ApiError from '../exceptions/ApiError.js';
import logger from '../utils/logger.js';
import { maintainStreak } from '../streak-engine/streak.js';
import {parseEntry} from './entryParserOrchestrator.js';
import redis from '../streak-engine/startUp.js';
import * as merchantRepository from '../repositories/merchant.js';
import { getLocalDateString } from '../parser/dates.js';

const invalidateInsightsCache = async (userId) => {
    try {
        await Promise.all([
            redis.del(`insights:${userId}:weekly`),
            redis.del(`insights:${userId}:monthly`),
            redis.del(`insights:${userId}:yearly`)
        ]);
        logger.debug({ userId }, 'Invalidated insights Redis cache keys');
    } catch (err) {
        logger.error({ err, userId }, 'Failed to invalidate insights cache in Redis');
    }
};

export const getEntries = async (userId, filters) => {
    logger.trace({ userId, filters }, 'Service getEntries started');
    const user = await usersRepository.getUserById(userId);
    if (!user) {
        logger.warn({ userId }, 'User verification failed in getEntries');
        throw new ApiError(404, "User not found");
    }

    const fetchEntries = await entriesRepository.fetchEntriesByUser(userId, filters);
    logger.debug({ userId, count: fetchEntries.length }, 'Successfully queried database for entries');
    return {entries: fetchEntries, total: fetchEntries.length};
};

export const postEntry = async (userId, rawText, timezoneOffsetMinutes, ianaTimezone = null) => {
    logger.trace({ userId, timezoneOffsetMinutes }, 'Service postEntry started');
    const user = await usersRepository.getUserById(userId);
    if (!user) {
        logger.warn({ userId }, 'User verification failed in postEntry');
        throw new ApiError(404, "User not found");
    }

    // Save the user's incoming message first
    const userMsg = await chatRepository.createChatMessage({
        userId,
        sender: 'user',
        text: rawText,
        type: 'text'
    });

    let parsed;
    try {
        logger.debug({ userId, rawText }, 'Beginning transaction parsing orchestration');
        parsed = await parseEntry(rawText, timezoneOffsetMinutes, ianaTimezone);
        logger.debug({ userId, parsedResult: parsed }, 'Parsing orchestration returned resolved fields');
    } catch (parseErr) {
        logger.error({ err: parseErr, userId }, 'Failed to parse raw entry text');
        const errorMsg = "Hmm, I couldn't catch that. Try: 'Spent 200 on food' or 'no spend today'.";
        await chatRepository.createChatMessage({
            userId,
            sender: 'system',
            text: errorMsg,
            type: 'text'
        });
        throw parseErr;
    }

    // Handle future dates (sarcastic rejection)
    if (parsed.isFuture) {
        const sysMsgText = "Nice try, time traveler! 🚀 We can't log expenses for future dates.";
        const sysMsg = await chatRepository.createChatMessage({
            userId,
            sender: 'system',
            text: sysMsgText,
            type: 'text'
        });

        return {
            entry: null,
            streak: {
                current_streak: 0,
                updated: false
            },
            confirmation: sysMsgText,
            chatMessages: [userMsg, sysMsg]
        };
    }

    // Handle non-logging intents (query or other chitchat)
    if (parsed.intent !== 'log_expense') {
        const sysMsgText = parsed.intent === 'query'
            ? "I can only help you log expenses or save days right now."
            : "Doesn't look like an expense — try something like 'spent 200 on lunch' or 'no spend today'.";

        const sysMsg = await chatRepository.createChatMessage({
            userId,
            sender: 'system',
            text: sysMsgText,
            type: 'text'
        });

        return {
            entry: null,
            streak: {
                current_streak: 0,
                updated: false
            },
            confirmation: sysMsgText,
            chatMessages: [userMsg, sysMsg]
        };
    }

    const saveEntry = await entriesRepository.createEntry({
        userId,
        rawText: parsed.rawText,
        amount: parsed.amount,
        category: parsed.category,
        type: parsed.type,
        confidenceLevel: parsed.confidenceLevel ? parsed.confidenceLevel.toLowerCase() : 'low',
        expenseDate: new Date(`${parsed.expenseDate}T00:00:00.000Z`)
    });
    logger.debug({ userId, entryId: saveEntry.id }, 'Successfully saved entry to Postgres');

    logger.debug({ userId, type: parsed.type }, 'Initiating streak maintenance operation');
    const streakResult = await maintainStreak({
        userId,
        entryType: parsed.type,
        timezoneOffsetMinutes
    });
    logger.info({ userId, streak: streakResult.streak, updated: streakResult.updated }, 'Streak maintenance completed successfully');

    let confirmation = '';
    if (parsed.type === 'expense') {
        const amtStr = parsed.amount !== null ? `₹${parsed.amount}` : '—';
        confirmation = `${amtStr} added under ${parsed.category} for today. Edit?`;
    } else if (parsed.type === 'save_day') {
        if (parsed.amount === null) {
            confirmation = `Got it! No-spend day logged. 🔥 Streak: ${streakResult.streak} days`;
        } else {
            confirmation = `Awesome! Saved ₹${parsed.amount} today. 💰 Streak: ${streakResult.streak} days`;
        }
    }

    const chatMessages = [userMsg];
    if (parsed.type === 'expense') {
        const sysMsg = await chatRepository.createChatMessage({
            userId,
            sender: 'system',
            text: confirmation,
            type: 'confirm_card',
            payload: {
                id: saveEntry.id,
                type: saveEntry.type,
                amount: saveEntry.amount !== null ? Number(saveEntry.amount) : null,
                category: saveEntry.category,
                confidence: saveEntry.confidenceLevel,
                expenseDate: parsed.expenseDate,
                unmappedMerchant: parsed.unmappedMerchant || null,
                streak: {
                    current_streak: streakResult.streak,
                    updated: streakResult.updated
                }
            }
        });
        chatMessages.push(sysMsg);
    } else {
        const sysMsg = await chatRepository.createChatMessage({
            userId,
            sender: 'system',
            text: confirmation,
            type: 'text'
        });
        chatMessages.push(sysMsg);
        
        if (streakResult.updated && streakResult.streak > 0) {
            const streakMsg = await chatRepository.createChatMessage({
                userId,
                sender: 'system',
                text: '',
                type: 'streak',
                payload: { days: streakResult.streak }
            });
            chatMessages.push(streakMsg);
        }
    }

    await invalidateInsightsCache(userId);

    return {
        entry: saveEntry,
        streak: {
            current_streak: streakResult.streak,
            updated: streakResult.updated
        },
        confirmation,
        chatMessages
    };
};

export const patchEntry = async (userId, entryId, updatedEntry, timezoneOffsetMinutes = 0) => {
    logger.trace({ userId, entryId }, 'Service patchEntry started');
    const user = await usersRepository.getUserById(userId);
    if (!user) {
        logger.warn({ userId }, 'User verification failed in patchEntry');
        throw new ApiError(404, "User not found");
    }
    
    if (updatedEntry.expenseDate) {
        const localToday = getLocalDateString(timezoneOffsetMinutes, 0);
        const dateStr = typeof updatedEntry.expenseDate === 'string'
            ? updatedEntry.expenseDate.slice(0, 10)
            : new Date(updatedEntry.expenseDate).toISOString().slice(0, 10);

        if (dateStr > localToday) {
            throw new ApiError(400, "Nice try, time traveler! 🚀 We can't log expenses for future dates.");
        }
        updatedEntry.expenseDate = new Date(`${dateStr}T00:00:00.000Z`);
    }

    const patchResult = await entriesRepository.patchEntry(userId, entryId, updatedEntry);
    logger.info({ userId, entryId }, 'Successfully updated entry fields in database');

    try {
        const confirmMsg = await chatRepository.findConfirmCardMessage(userId, entryId);
        if (confirmMsg) {
            const hasStreakUpdate = confirmMsg.payload && confirmMsg.payload.streak && confirmMsg.payload.streak.updated;
            const streakDays = confirmMsg.payload?.streak?.current_streak || 0;

            // If user edited/corrected from General and has unmappedMerchant, log the correction
            if (confirmMsg.payload?.unmappedMerchant && updatedEntry.category && updatedEntry.category !== 'General') {
                try {
                    await merchantRepository.logCorrection(confirmMsg.payload.unmappedMerchant, updatedEntry.category);
                    logger.info({ merchantName: confirmMsg.payload.unmappedMerchant, correctedCategory: updatedEntry.category }, 'Successfully logged unrecognized merchant category correction');
                } catch (merchantErr) {
                    logger.error({ err: merchantErr }, 'Failed to log unrecognized merchant category correction');
                }
            }

            await chatRepository.updateChatMessage(confirmMsg.id, {
                isConfirmed: true
            });
            logger.info({ messageId: confirmMsg.id }, 'Successfully marked chat confirm card as confirmed in database');

            if (hasStreakUpdate && streakDays > 0) {
                await chatRepository.createChatMessage({
                    userId,
                    sender: 'system',
                    text: '',
                    type: 'streak',
                    payload: { days: streakDays }
                });
                logger.info('Saved streak message for confirmed expense to DB');
            }
        }
    } catch (err) {
        logger.error({ err, entryId }, 'Failed to find/update corresponding chat message on entry patch');
    }

    await invalidateInsightsCache(userId);

    return patchResult;
}

export const deleteEntry = async (userId, entryId) => {
    logger.trace({ userId, entryId }, 'Service deleteEntry started');
    const user = await usersRepository.getUserById(userId);
    if (!user) {
        logger.warn({ userId }, 'User verification failed in deleteEntry');
        throw new ApiError(404, "User not found");
    }
    
    const deleteResult = await entriesRepository.deleteEntry(userId, entryId);
    logger.info({ userId, entryId }, 'Successfully soft-deleted entry in database');
    
    await invalidateInsightsCache(userId);
    
    return deleteResult;
}


