import * as streakRepository from '../repositories/streak.js';
import { getPreviousDate, getTodayInUserZone, toIsoDate } from '../utils/dates.js';
import redis from '../streak-engine/startUp.js';
import logger from '../utils/logger.js';

/**
 * PERFORMANCE & CONSISTENCY DECISION:
 * When getStreaks detects an expired streak or applies a streak freeze, it mutates
 * the streak state in PostgreSQL. Without explicitly invalidating Redis here, the
 * streak engine (`maintainStreak`) would load stale streak counts from Redis on the
 * user's next entry creation, causing streak resurrection/desynchronization.
 * 
 * We invalidate both key formatting conventions (colon-separated and namespace-separated)
 * so that the streak engine is guaranteed to re-sync from PostgreSQL on the next write.
 */
const invalidateStreakCache = async (userId) => {
    try {
        await Promise.all([
            redis.del(`streak:${userId}:current`),
            redis.del(`streak:${userId}:last_date`),
            redis.del(`streak:current:${userId}`),
            redis.del(`streak:lastDate:${userId}`)
        ]);
        logger.debug({ userId }, 'Invalidated streak Redis cache keys');
    } catch (err) {
        logger.error({ err, userId }, 'Failed to invalidate streak cache in Redis');
    }
};

export const getStreaks = async (userId, timezoneOffsetMinutes) => {
    let streak = await streakRepository.getStreakByUserId(userId);

    if (!streak) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastLoggedDate: null,
            freezesAvailable: 2,
            freezeUsedToday: false,
        }
    }
    let freezeUsedToday = false;
    if (streak.lastLoggedDate) {
        const today = getTodayInUserZone({timezoneOffsetMinutes});
        const yesterday = getPreviousDate(today);

        const lastLoggedDateStr = toIsoDate(streak.lastLoggedDate);

        if (lastLoggedDateStr !== today && lastLoggedDateStr !== yesterday) {
            if (streak.freezesAvailable > 0) {
                streak.freezesAvailable -= 1;
                streak.lastFreezeUsedAt = new Date();
                freezeUsedToday = true;

                await streakRepository.updateStreak(userId, {currentStreak: streak.currentStreak, lastLoggedDate: new Date(`${yesterday}T00:00:00.000Z`), freezesAvailable: streak.freezesAvailable, lastFreezeUsedAt: streak.lastFreezeUsedAt});
                await invalidateStreakCache(userId);
            }
            else {
                streak.currentStreak = 0;
                await streakRepository.updateStreak(userId, {currentStreak: 0, lastLoggedDate: streak.lastLoggedDate});
                await invalidateStreakCache(userId);
            }
        }
    }
    return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastLoggedDate: streak.lastLoggedDate ? toIsoDate(streak.lastLoggedDate) : null,
        freezesAvailable: streak.freezesAvailable ?? 2,
        freezeUsedToday
    };
};
