import * as insightsService from '../services/insights.js'
import logger from '../utils/logger.js';

const VALID_PERIODS = new Set(['weekly', 'monthly', 'yearly']);

export const getInsightsByPeriod = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const period = req.params.period || null;

        logger.info({ userId, period }, 'Incoming request to retrieve period insights');

        if (!VALID_PERIODS.has(period)) {
            logger.warn({ userId, period }, 'Blocked insights request due to invalid period parameter');
            return res.status(400).json({
                error: 'INVALID_PERIOD',
                message: 'Period can only be weekly, monthly or yearly.'
            });
        }

        const timezoneOffsetMinutes = req.headers['x-timezone-offset-minutes'] || 0;

        const insights = await insightsService.getInsightsByPeriod(userId, period, timezoneOffsetMinutes);
        
        logger.info({ userId, period, dataConfidence: insights.data_confidence }, 'Successfully generated and retrieved period insights');
        
        return res.status(200).json(insights);
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id, period: req.params.period }, 'Failed to retrieve period insights in controller');
        next(error);
    }
}