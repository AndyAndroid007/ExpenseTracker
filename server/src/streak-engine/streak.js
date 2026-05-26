import redis from './startUp.js';
import prisma from '../lib/db.js';

const VALID_STREAK_ENTRY_TYPES = new Set([
    'expense',
    'no-spend',
    'save-day',
    'no_spend',
    'save_day'
]);

const getCurrentKey = (userId) => `streak:${userId}:current`;
const getLastDateKey = (userId) => `streak:${userId}:last_date`;

const toIsoDate = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDateByOffsetMinutes = (date, offsetMinutes) => {
    const shiftedDate = new Date(date.getTime() + (offsetMinutes * 60 * 1000));
    return toIsoDate(shiftedDate);
};

const getDateByTimeZone = (date, timeZone) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const parts = formatter.formatToParts(date);

    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;

    if (!year || !month || !day) {
        throw new Error('Unable to derive date from timezone');
    }

    return `${year}-${month}-${day}`;
};

const parseOffsetToMinutes = (offset) => {
    if (offset === undefined || offset === null) {
        return null;
    }

    if (typeof offset === 'number' && Number.isFinite(offset)) {
        return Math.trunc(offset);
    }

    if (typeof offset !== 'string') {
        return null;
    }

    const trimmed = offset.trim();
    if (!trimmed) {
        return null;
    }

    if (/^[+-]?\d+$/.test(trimmed)) {
        return Number.parseInt(trimmed, 10);
    }

    const match = trimmed.match(/^([+-])(\d{2}):?(\d{2})$/);
    if (!match) {
        return null;
    }

    const sign = match[1] === '-' ? -1 : 1;
    const hours = Number.parseInt(match[2], 10);
    const minutes = Number.parseInt(match[3], 10);

    return sign * ((hours * 60) + minutes);
};

const getTodayInUserZone = ({ date = new Date(), timezone, timezoneOffsetMinutes } = {}) => {
    const parsedOffset = parseOffsetToMinutes(timezoneOffsetMinutes);

    if (parsedOffset !== null) {
        return getDateByOffsetMinutes(date, parsedOffset);
    }

    if (timezone) {
        return getDateByTimeZone(date, timezone);
    }

    return toIsoDate(date);
};

const getPreviousDate = (isoDate) => {
    const previous = new Date(`${isoDate}T00:00:00.000Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    return toIsoDate(previous);
};

const parseCurrentStreak = (value) => {
    if (!value) {
        return 0;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
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
        throw new Error('userId is required for streak evaluation');
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

    const { currentStreak, lastLoggedDate } = await loadStreakFromPostgres(userId);
    let nextStreak = currentStreak;
    let nextLastLoggedDate = lastLoggedDate;
    let updated = false;

    if (lastLoggedDate === today) {
        updated = false;
    } else if (lastLoggedDate === yesterday) {
        nextStreak = Math.max(1, currentStreak + 1);
        nextLastLoggedDate = today;
        updated = true;
    } else {
        nextStreak = 1;
        nextLastLoggedDate = today;
        updated = true;
    }

    if (updated) {
        await persistStreakToPostgres({
            userId,
            currentStreak: nextStreak,
            lastLoggedDate: nextLastLoggedDate
        });

        // Invalidate Redis so subsequent reads repopulate from Postgres (source of truth).
        await invalidateStreakCache(userId);
    }

    return {
        updated,
        skipped: false,
        streak: nextStreak,
        lastLoggedDate: nextLastLoggedDate,
        today
    };
};