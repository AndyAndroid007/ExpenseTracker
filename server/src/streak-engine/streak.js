import redis from './startUp.js';
import prisma from '../lib/db.js';
import logger from '../utils/logger.js';
import {getTodayInUserZone, getPreviousDate, toIsoDate } from '../utils/dates.js';

const VALID_STREAK_ENTRY_TYPES = new Set([
    'expense',
    'no-spend',
    'save-day',
    'no_spend',
    'save_day'
]);

const getCurrentKey = (userId) => `streak:${userId}:current`;
const getLastDateKey = (userId) => `streak:${userId}:last_date`;


const parseCurrentStreak = (value) => {
    if (!value) {
        return 0;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
};



const loadStreakFromRedis = async (userId) => {
    try {
        const [currentStreak, lastLoggedDateVal] = await redis.mGet([
            getCurrentKey(userId),
            getLastDateKey(userId)
        ]);
        
        if (currentStreak === null || lastLoggedDateVal === null) {
            return null; //Cache Miss
        }

        return {
            currentStreak: Number.parseInt(currentStreak, 10) || 0,
            lastLoggedDate: lastLoggedDateVal === 'null' ? null : lastLoggedDateVal
        };
    } catch (err) {
        logger.error({ err, userId}, 'Failed to read streak from Redis cache');
        return null;    
    }

};

const saveStreakToRedis = async (userId, {currentStreak, lastLoggedDate}) => {
    try {
        await redis.mSet([
            [getCurrentKey(userId), currentStreak],
            [getLastDateKey(userId), lastLoggedDate || 'null']
        ]);

        await redis.expire(getCurrentKey(userId), 172800);
        await redis.expire(getLastDateKey(userId), 172800);

    } catch (err) {
        logger.error({ err, userId }, 'Failed to save streak to Redis cache');
        
    }
};

const loadStreakFromPostgres = async (userId) => {
    const streak = await prisma.streak.findUnique({
        where: { userId },
        select: {
            currentStreak: true,
            lastLoggedDate: true
        }
    });

    if (!streak) {
        return {
            currentStreak: 0,
            lastLoggedDate: null,
            dbHit: false
        };
    }

    const lastLoggedDate = streak.lastLoggedDate ? toIsoDate(streak.lastLoggedDate) : null;

    return {
        currentStreak: streak.currentStreak,
        lastLoggedDate,
        dbHit: true
    };
};

const persistStreakToPostgres = async ({ userId, currentStreak, lastLoggedDate }) => {
    const existing = await prisma.streak.findUnique({
        where: { userId },
        select: { longestStreak: true }
    });

    const nextLongest = Math.max(existing?.longestStreak ?? 0, currentStreak);
    const lastLoggedDateAsDate = new Date(`${lastLoggedDate}T00:00:00.000Z`);

    await prisma.streak.upsert({
        where: { userId },
        create: {
            userId,
            currentStreak,
            longestStreak: nextLongest,
            lastLoggedDate: lastLoggedDateAsDate
        },
        update: {
            currentStreak,
            longestStreak: nextLongest,
            lastLoggedDate: lastLoggedDateAsDate
        }
    });
};

const invalidateStreakCache = async (userId) => {
    await redis.del(getCurrentKey(userId), getLastDateKey(userId));
};

export const isValidStreakEntryType = (entryType) => {
    if (typeof entryType !== 'string') {
        return false;
    }

    return VALID_STREAK_ENTRY_TYPES.has(entryType.trim().toLowerCase());
};

export const maintainStreak = async ({
    userId,
    entryType,
    timezone,
    timezoneOffsetMinutes,
    now = new Date()
}) => {
    if (!userId) {
        throw new Error('UserId is required for streak evaluation');
    }

    if (!isValidStreakEntryType(entryType)) {
        return {
            updated: false,
            skipped: true,
            reason: 'unsupported_entry_type'
        };
    }

    const today = getTodayInUserZone({
        date: now,
        timezone,
        timezoneOffsetMinutes
    });
    const yesterday = getPreviousDate(today);

    let streakData = await loadStreakFromRedis(userId);
    let cacheHit = true;

    if (!streakData) {
        cacheHit = false;
        logger.info({userId}, 'Streak cache miss. Querying database');
        const dbResult = await loadStreakFromPostgres(userId);

        streakData = {
            currentStreak: dbResult.currentStreak,
            lastLoggedDate: dbResult.lastLoggedDate
        };

        await saveStreakToRedis(userId, streakData);
    }
    else {
        logger.info({ userId }, 'Streak cache hit. Read successfully from Redis');
    }
    const currentStreak = streakData.currentStreak;
    const lastLoggedDate = streakData.lastLoggedDate;
    let nextStreak = currentStreak;
    let nextLastLoggedDate = lastLoggedDate;
    let updated = false;
    // 2. Evaluate streak logic
    if (lastLoggedDate === today) {
        logger.debug({ userId, today }, 'User already logged today. Streak unchanged.');
        updated = false;
    } else if (lastLoggedDate === yesterday) {
        nextStreak = Math.max(1, currentStreak + 1);
        nextLastLoggedDate = today;
        updated = true;
        logger.info({ userId, nextStreak }, 'Streak incremented!');
    } else {
        nextStreak = 1;
        nextLastLoggedDate = today;
        updated = true;
        logger.info({ userId }, 'Streak reset to 1 day.');
    }
    // 3. Write back changes if updated
    if (updated) {
        // Save to Postgres (Source of truth)
        await persistStreakToPostgres({
            userId,
            currentStreak: nextStreak,
            lastLoggedDate: nextLastLoggedDate
        });
        // Write directly to Redis cache to keep it in sync (no need to delete!)
        await saveStreakToRedis(userId, {
            currentStreak: nextStreak,
            lastLoggedDate: nextLastLoggedDate
        });
    }
    return {
        updated,
        skipped: false,
        streak: nextStreak,
        lastLoggedDate: nextLastLoggedDate,
        today,
        cacheHit
    };
};