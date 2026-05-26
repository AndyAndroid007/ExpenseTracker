import * as entryService from '../services/entries.js';
import { maintainStreak } from '../streak-engine/streak.js';

export const postEntry = async (req, res, next) => {
    
    try {
        // userId = req.user.userId;
        const userEntry = await entryService.postEntry("userId", req.body.rawText);

        if (req.user?.userId && req.body?.type) {
            void maintainStreak({
                userId: req.user.userId,
                entryType: req.body.type,
                timezone: req.headers['x-timezone'],
                timezoneOffsetMinutes: req.headers['x-timezone-offset-minutes']
            }).catch((streakError) => {
                console.error('Streak update failed', {
                    userId: req.user.userId,
                    error: streakError.message
                });
            });
        }

        res.status(201).json(userEntry);
    } catch (error) {
        next(error);
    };
}

export const getEntries = async (req, res, next) => {
    try {
        const existingEntries = await entryService.getEntries("req.user.userId", Date.now());
        res.status(200).json(existingEntries);
    } catch (error) {
        next(error);
    }
}