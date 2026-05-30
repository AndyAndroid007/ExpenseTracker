import * as streakService from '../services/streak.js'
import logger from '../utils/logger.js';

export const getStreaks = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const timezoneOffsetMinutes = req.headers['x-timezone-offset-minutes'] || 0;
        
        logger.info({ userId, timezoneOffsetMinutes }, 'Incoming request to fetch user streak details');
        
        const streak = await streakService.getStreaks(userId, timezoneOffsetMinutes);
        
        logger.info({ userId, currentStreak: streak.currentStreak }, 'Successfully retrieved user streak details');
        
        return res.status(200).json({
            current_streak: streak.currentStreak,
            longest_streak: streak.longestStreak,
            last_logged_date: streak.lastLoggedDate
        });
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id }, 'Failed to retrieve streak details in controller');
        next(error);
    }
}