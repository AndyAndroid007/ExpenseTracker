import redis from '../src/streak-engine/startUp.js';
import { incrementAndCheckQueryLimit, checkLowConfidenceLimit } from '../src/middlewares/rateLimitMiddleware.js';

describe('Redis-Backed Rate Limiting Subsystem Unit Tests', () => {
    const testUserId = 'test-rate-limit-user-123';

    beforeEach(async () => {
        // Clear rate limiting keys from Redis for the test user to ensure isolation
        try {
            if (redis && redis.isOpen) {
                await redis.del(`rate:query:${testUserId}:minute`);
                await redis.del(`rate:query:${testUserId}:day`);
                await redis.del(`rate:lowconf:${testUserId}:day`);
            }
        } catch (err) {
            // Ignore if Redis is down/test environment is running without it
        }
    });

    describe('Query Rate Limiter', () => {
        it('should allow up to 3 queries in a minute and block the 4th', async () => {
            // 1st request
            let result = await incrementAndCheckQueryLimit(testUserId);
            expect(result.limited).toBe(false);

            // 2nd request
            result = await incrementAndCheckQueryLimit(testUserId);
            expect(result.limited).toBe(false);

            // 3rd request
            result = await incrementAndCheckQueryLimit(testUserId);
            expect(result.limited).toBe(false);

            // 4th request (should be blocked)
            result = await incrementAndCheckQueryLimit(testUserId);
            expect(result.limited).toBe(true);
            expect(result.message).toMatch(/(slow down|moving fast|take it easy)/i);
        });

        it('should enforce daily limit of 10 queries', async () => {
            // Send queries 1-3
            for (let i = 0; i < 3; i++) {
                const res = await incrementAndCheckQueryLimit(testUserId);
                expect(res.limited).toBe(false);
            }

            // Clear minute key to bypass 3/min rolling limit
            try {
                if (redis && redis.isOpen) {
                    await redis.del(`rate:query:${testUserId}:minute`);
                }
            } catch (err) {}

            // Send queries 4-6
            for (let i = 0; i < 3; i++) {
                const res = await incrementAndCheckQueryLimit(testUserId);
                expect(res.limited).toBe(false);
            }

            // Clear minute key again
            try {
                if (redis && redis.isOpen) {
                    await redis.del(`rate:query:${testUserId}:minute`);
                }
            } catch (err) {}

            // Send queries 7-9
            for (let i = 0; i < 3; i++) {
                const res = await incrementAndCheckQueryLimit(testUserId);
                expect(res.limited).toBe(false);
            }

            // Clear minute key again
            try {
                if (redis && redis.isOpen) {
                    await redis.del(`rate:query:${testUserId}:minute`);
                }
            } catch (err) {}

            // Send query 10 (should be allowed)
            const res10 = await incrementAndCheckQueryLimit(testUserId);
            expect(res10.limited).toBe(false);

            // Clear minute key one last time
            try {
                if (redis && redis.isOpen) {
                    await redis.del(`rate:query:${testUserId}:minute`);
                }
            } catch (err) {}

            // The 11th query should be blocked by the daily limit
            const res11 = await incrementAndCheckQueryLimit(testUserId);
            expect(res11.limited).toBe(true);
            expect(res11.message).toContain("daily limit of 10 questions");
        });
    });

    describe('Low Confidence Fallback Cap Limiter', () => {
        it('should allow up to 5 fallback attempts and block on the 6th', async () => {
            // Call 5 times - all should return true (allowed)
            for (let i = 0; i < 5; i++) {
                const allowed = await checkLowConfidenceLimit(testUserId);
                expect(allowed).toBe(true);
            }

            // 6th call should return false (blocked)
            const allowed6 = await checkLowConfidenceLimit(testUserId);
            expect(allowed6).toBe(false);
        });
    });
});
