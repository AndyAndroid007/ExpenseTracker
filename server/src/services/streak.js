import * as streakRepository from '../repositories/streak.js';
import { getPreviousDate, getTodayInUserZone, toIsoDate } from '../utils/dates.js';

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
            }
            else {
                streak.currentStreak = 0
                await streakRepository.updateStreak(userId, {currentStreak: 0, lastLoggedDate: streak.lastLoggedDate});
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
