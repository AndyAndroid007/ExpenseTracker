import * as entriesRepository from '../repositories/entries.js'
import * as usersRepository from '../repositories/users.js'
import ApiError from '../exceptions/ApiError.js';
import logger from '../utils/logger.js';
import { maintainStreak } from '../streak-engine/streak.js';
import {parseEntry} from './entryParserOrchestrator.js';

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

export const postEntry = async (userId, rawText, timezoneOffsetMinutes) => {
    logger.trace({ userId, timezoneOffsetMinutes }, 'Service postEntry started');
    const user = await usersRepository.getUserById(userId);
    if (!user) {
        logger.warn({ userId }, 'User verification failed in postEntry');
        throw new ApiError(404, "User not found");
    }

    logger.debug({ userId, rawText }, 'Beginning transaction parsing orchestration');
    const parsed = await parseEntry(rawText, timezoneOffsetMinutes);
    logger.debug({ userId, parsedResult: parsed }, 'Parsing orchestration returned resolved fields');

    if (parsed.type === 'expense' && parsed.amount === null) {
        logger.warn({ userId, rawText }, 'Parsing returned low-confidence missing amount for expense');
        throw new ApiError(400, "Could not extract an amount from your input. Try: 'Spent 200 on food for example'");
    }

    const saveEntry = await entriesRepository.createEntry({
        userId,
        rawText: parsed.rawText,
        amount: parsed.amount,
        category: parsed.category,
        type: parsed.type,
        confidenceLevel: parsed.confidenceLevel,
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
        confirmation = `₹${parsed.amount} added under ${parsed.category} for today. Edit?`;
    } else if (parsed.type === 'no_spend') {
        confirmation = `Got it! No-spend day logged. 🔥 Streak: ${streakResult.streak} days`;
    } else if (parsed.type === 'save_day') {
        const amtStr = parsed.amount ? ` ₹${parsed.amount}` : '';
        confirmation = `Awesome! Saved${amtStr} today. 💰 Streak: ${streakResult.streak} days`;
    }

    return {
        entry: saveEntry,
        streak: {
            current_streak: streakResult.streak,
            updated: streakResult.updated
        },
        confirmation
    }
};

export const patchEntry = async (userId, entryId, updatedEntry) => {
    logger.trace({ userId, entryId }, 'Service patchEntry started');
    const user = await usersRepository.getUserById(userId);
    if (!user) {
        logger.warn({ userId }, 'User verification failed in patchEntry');
        throw new ApiError(404, "User not found");
    }
    
    const patchResult = await entriesRepository.patchEntry(userId, entryId, updatedEntry);
    logger.info({ userId, entryId }, 'Successfully updated entry fields in database');
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
    return deleteResult;
}


