import * as insightsRepository from '../repositories/insights.js';
import { getTodayInUserZone, toIsoDate } from '../utils/dates.js';
import { generateInsightsWithLLM } from './llm.js';
import redis from '../streak-engine/startUp.js';
import logger from '../utils/logger.js';


/**
 * Calculates timezone-aware date boundaries (from / to) based on period.
 */
const calculateDateBoundaries = (period, timezoneOffsetMinutes) => {
    const todayStr = getTodayInUserZone({ timezoneOffsetMinutes });
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

    let from, to;

    if (period === 'weekly') {
        const day = todayDate.getUTCDay();
        const diffToMonday = todayDate.getUTCDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(todayDate);
        monday.setUTCDate(diffToMonday);

        const sunday = new Date(monday);
        sunday.setUTCDate(monday.getUTCDate() + 6);

        from = toIsoDate(monday);
        to = toIsoDate(sunday);
    } else if (period === 'monthly') {
        const year = todayDate.getUTCFullYear();
        const month = todayDate.getUTCMonth(); // 0-indexed

        from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(Date.UTC(year, month + 1, 0));
        to = toIsoDate(lastDay);
    } else if (period === 'yearly') {
        const year = todayDate.getUTCFullYear();
        from = `${year}-01-01`;
        to = `${year}-12-31`;
    }

    return { from, to };
};

export const getInsightsByPeriod = async (userId, period, timezoneOffsetMinutes = 0) => {
    const cacheKey = `insights:${userId}:${period}`;
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            logger.info({ userId, period }, 'Insights cache hit. Read successfully from Redis');
            return JSON.parse(cachedData);
        }
    } catch (err) {
        logger.error({ err, userId, period }, 'Failed to read insights from Redis cache');
    }

    // 1. Calculate boundaries
    const { from, to } = calculateDateBoundaries(period, timezoneOffsetMinutes);

    // 2. Fetch high-performance database aggregates from PostgreSQL
    const { 
        totalLogs, 
        categorySums, 
        noSpendDaysCount, 
        saveDaysCount 
    } = await insightsRepository.aggregatePeriodData(userId, from, to);

    // 3. Process database category group sums
    let totalSpend = 0;
    const categoryBreakdown = {};

    categorySums.forEach(group => {
        const category = group.category || 'General';
        const sum = Number(group._sum.amount) || 0;
        totalSpend += sum;
        categoryBreakdown[category] = sum;
    });

    // 4. Find top spending category
    let topCategory = null;
    let maxSpend = 0;
    Object.entries(categoryBreakdown).forEach(([category, spend]) => {
        if (spend > maxSpend) {
            maxSpend = spend;
            topCategory = category;
        }
    });

    // 5. Determine data confidence level
    const dataConfidence = totalLogs < 3 ? 'low' : 'high';

    // 6. Hybrid Dynamic Insights Generator (Gemini LLM)
    let insights = [];
    if (dataConfidence === 'low') {
        insights = [`Log at least 3 entries in this period to unlock personalized AI insights! Current logs: ${totalLogs}`];
    } else {
        const summaryData = {
            period,
            total_spend: Number(totalSpend.toFixed(2)),
            no_spend_days: noSpendDaysCount,
            save_days: saveDaysCount,
            top_category: topCategory,
            category_breakdown: categoryBreakdown
        };

        const aiInsights = await generateInsightsWithLLM(summaryData);
        
        if (aiInsights && aiInsights.length === 3) {
            insights = aiInsights;
        } else {
            // Premium local fallback if LLM is unconfigured or encounters an error
            insights = [
                `You successfully logged ${noSpendDaysCount} no-spend days! 🔥`,
                topCategory ? `${topCategory} was your top spending category at ₹${maxSpend.toFixed(2)}.` : "No spending logged yet."
            ];
        }
    }

    const result = {
        period,
        start_date: from,
        end_date: to,
        total_spend: Number(totalSpend.toFixed(2)),
        no_spend_days: noSpendDaysCount,
        save_days: saveDaysCount,
        top_category: topCategory,
        category_breakdown: categoryBreakdown,
        insights,
        data_confidence: dataConfidence
    };

    try {
        // Cache insights for 24 hours
        await redis.set(cacheKey, JSON.stringify(result), { EX: 86400 });
        logger.info({ userId, period }, 'Successfully saved generated insights to Redis cache');
    } catch (err) {
        logger.error({ err, userId, period }, 'Failed to save insights to Redis cache');
    }

    return result;
};
