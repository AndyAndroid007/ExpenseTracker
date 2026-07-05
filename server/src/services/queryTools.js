import * as insightsRepository from '../repositories/insights.js';
import * as entriesRepository from '../repositories/entries.js';
import * as streakRepository from '../repositories/streak.js';
import logger from '../utils/logger.js';

/**
 * Retrieve spending summary aggregates for a given date range.
 */
export const getSpendingSummary = async (userId, { from_date, to_date, category }) => {
  logger.info({ userId, from_date, to_date, category }, 'Query Tool: getSpendingSummary invoked');

  try {
    const {
      totalLogs,
      categorySums,
      noSpendDaysCount,
      saveDaysCount
    } = await insightsRepository.aggregatePeriodData(userId, from_date, to_date);

    let totalSpend = 0;
    const categoryBreakdown = {};

    categorySums.forEach(group => {
      const cat = group.category || 'General';
      const sum = Number(group._sum.amount) || 0;
      
      if (!category || cat.toLowerCase() === category.toLowerCase()) {
        totalSpend += sum;
        categoryBreakdown[cat] = sum;
      }
    });

    return {
      total_spend: Number(totalSpend.toFixed(2)),
      no_spend_days: noSpendDaysCount,
      save_days: saveDaysCount,
      category_breakdown: categoryBreakdown,
      source_range: { from: from_date, to: to_date }
    };
  } catch (err) {
    logger.error({ err, userId }, 'Query Tool: getSpendingSummary failed');
    return { error: 'INTERNAL_ERROR', message: 'Failed to retrieve aggregates.' };
  }
};

/**
 * Retrieve a list of individual transaction entries for a given date range.
 * Enforces the 14-day date range limit.
 */
export const getTransactionsList = async (userId, { from_date, to_date, category, limit }) => {
  logger.info({ userId, from_date, to_date, category, limit }, 'Query Tool: getTransactionsList invoked');

  try {
    const from = new Date(`${from_date}T00:00:00.000Z`);
    const to = new Date(`${to_date}T00:00:00.000Z`);
    
    // Enforce 14-day limit
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 14) {
      logger.warn({ userId, diffDays }, 'Query Tool: getTransactionsList rejected (range > 14 days)');
      return {
        error: 'RANGE_TOO_LONG',
        message: 'Transaction listings are restricted to a maximum range of 14 days. Please use get_spending_summary for larger periods.'
      };
    }

    const entries = await entriesRepository.fetchEntriesByUser(userId, {
      from: from_date,
      to: to_date,
      limit: limit ? parseInt(limit, 10) : 20
    });

    const filtered = entries
      .filter(e => !category || (e.category && e.category.toLowerCase() === category.toLowerCase()))
      .map(e => ({
        id: e.id,
        amount: e.amount ? Number(e.amount) : null,
        category: e.category,
        type: e.type,
        expense_date: e.expenseDate.toISOString().slice(0, 10),
        raw_text: e.rawText
      }));

    return {
      transactions: filtered,
      source_range: { from: from_date, to: to_date }
    };
  } catch (err) {
    logger.error({ err, userId }, 'Query Tool: getTransactionsList failed');
    return { error: 'INTERNAL_ERROR', message: 'Failed to fetch transaction records.' };
  }
};

/**
 * Retrieve the user's current streak and freeze details.
 */
export const getStreakDetails = async (userId) => {
  logger.info({ userId }, 'Query Tool: getStreakDetails invoked');

  try {
    const streak = await streakRepository.getStreakByUserId(userId);
    if (!streak) {
      return {
        current_streak: 0,
        longest_streak: 0,
        freezes_available: 0
      };
    }

    return {
      current_streak: streak.currentStreak,
      longest_streak: streak.longestStreak,
      last_logged_date: streak.lastLoggedDate ? streak.lastLoggedDate.toISOString().slice(0, 10) : null,
      freezes_available: streak.freezesAvailable
    };
  } catch (err) {
    logger.error({ err, userId }, 'Query Tool: getStreakDetails failed');
    return { error: 'INTERNAL_ERROR', message: 'Failed to retrieve streak details.' };
  }
};
