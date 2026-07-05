import redis from '../streak-engine/startUp.js';
import logger from '../utils/logger.js';
import getRandomReply from '../lib/replies.js';

// In-memory fallback if Redis is down
const memoryStore = new Map();

// Periodic cleanup of expired in-memory items (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of memoryStore.entries()) {
    if (val.expiresAt && val.expiresAt < now) {
      memoryStore.delete(key);
    }
  }
}, 300000);

const getIncrMemory = (key, durationMs) => {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.expiresAt < now) {
    memoryStore.set(key, { value: 1, expiresAt: now + durationMs });
    return 1;
  }
  entry.value += 1;
  return entry.value;
};

const getSlidingWindowMemory = (key, now, windowMs) => {
  let list = memoryStore.get(key) || [];
  list = list.filter(ts => ts > now - windowMs);
  list.push(now);
  memoryStore.set(key, list);
  return list.length;
};

/**
 * Middleware to check query rate limits:
 * - 3 queries per rolling minute (sliding window)
 * - 10 queries per day (fixed window resets at end of UTC day)
 */
export const checkQueryRateLimit = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) return next();

  const now = Date.now();
  const minuteKey = `rate:query:${userId}:minute`;
  const dayKey = `rate:query:${userId}:day`;

  // Calculate milliseconds until end of current UTC day
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  const msToDayEnd = endOfDay.getTime() - now;

  let minuteCount = 0;
  let dayCount = 0;

  let redisAvailable = false;
  try {
    if (redis && redis.isOpen) {
      redisAvailable = true;
    }
  } catch (err) {}

  if (redisAvailable) {
    try {
      const minTime = now - 60000;
      const multi = redis.multi();
      
      // Sliding window using sorted sets
      multi.zRemRangeByScore(minuteKey, 0, minTime);
      multi.zAdd(minuteKey, { score: now, value: `${now}-${Math.random()}` });
      multi.zCard(minuteKey);
      multi.expire(minuteKey, 60);

      // Daily limit using string increment
      multi.incr(dayKey);
      multi.expire(dayKey, Math.ceil(msToDayEnd / 1000));

      const results = await multi.exec();
      minuteCount = results[2]; // zCard
      dayCount = results[4];    // incr
    } catch (err) {
      logger.error({ err, userId }, 'Redis rate limit execution failed, falling back to memory');
      redisAvailable = false;
    }
  }

  if (!redisAvailable) {
    minuteCount = getSlidingWindowMemory(minuteKey, now, 60000);
    dayCount = getIncrMemory(dayKey, msToDayEnd);
  }

  if (minuteCount > 3) {
    logger.warn({ userId, minuteCount }, 'User exceeded rolling minute query rate limit');
    return res.status(429).json({
      error: 'RATE_LIMITED',
      message: getRandomReply('query_rate_limited')
    });
  }

  if (dayCount > 10) {
    logger.warn({ userId, dayCount }, 'User exceeded daily query rate limit');
    return res.status(429).json({
      error: 'RATE_LIMITED',
      message: "You've reached your daily limit of 10 questions. Let's chat again tomorrow!"
    });
  }

  next();
};

/**
 * Checks and increments daily low-confidence logging fallback count.
 * Exceeding this blocks the LLM correction.
 * 
 * @param {string} userId 
 * @returns {Promise<boolean>} True if allowed to use LLM fallback, False if blocked
 */
export const checkLowConfidenceLimit = async (userId) => {
  const now = Date.now();
  const key = `rate:lowconf:${userId}:day`;

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  const msToDayEnd = endOfDay.getTime() - now;

  let count = 0;
  let redisAvailable = false;
  try {
    if (redis && redis.isOpen) {
      redisAvailable = true;
    }
  } catch (err) {}

  if (redisAvailable) {
    try {
      count = await redis.incr(key);
      await redis.expire(key, Math.ceil(msToDayEnd / 1000));
    } catch (err) {
      logger.error({ err, userId }, 'Redis low confidence log limit check failed, falling back to memory');
      redisAvailable = false;
    }
  }

  if (!redisAvailable) {
    count = getIncrMemory(key, msToDayEnd);
  }

  // Allow up to 5 low confidence log corrections per day
  return count <= 5;
};

/**
 * Checks and increments query rate limits for a user (called within service context).
 * 
 * @param {string} userId 
 * @returns {Promise<{limited: boolean, message?: string}>} Rate limit status
 */
export const incrementAndCheckQueryLimit = async (userId) => {
  const now = Date.now();
  const minuteKey = `rate:query:${userId}:minute`;
  const dayKey = `rate:query:${userId}:day`;

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  const msToDayEnd = endOfDay.getTime() - now;

  let minuteCount = 0;
  let dayCount = 0;

  let redisAvailable = false;
  try {
    if (redis && redis.isOpen) {
      redisAvailable = true;
    }
  } catch (err) {}

  if (redisAvailable) {
    try {
      const minTime = now - 60000;
      const multi = redis.multi();
      multi.zRemRangeByScore(minuteKey, 0, minTime);
      multi.zAdd(minuteKey, { score: now, value: `${now}-${Math.random()}` });
      multi.zCard(minuteKey);
      multi.expire(minuteKey, 60);

      multi.incr(dayKey);
      multi.expire(dayKey, Math.ceil(msToDayEnd / 1000));

      const results = await multi.exec();
      minuteCount = results[2];
      dayCount = results[4];
    } catch (err) {
      logger.error({ err, userId }, 'Redis rate limit execution failed, falling back to memory');
      redisAvailable = false;
    }
  }

  if (!redisAvailable) {
    minuteCount = getSlidingWindowMemory(minuteKey, now, 60000);
    dayCount = getIncrMemory(dayKey, msToDayEnd);
  }

  if (minuteCount > 3) {
    return { limited: true, message: getRandomReply('query_rate_limited') };
  }

  if (dayCount > 10) {
    return { limited: true, message: "You've reached your daily limit of 10 questions. Let's chat again tomorrow!" };
  }

  return { limited: false };
};

