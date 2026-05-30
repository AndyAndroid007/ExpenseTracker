import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/db.js';

describe('Streak System Integration Tests', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
        // Clean database
        await prisma.entry.deleteMany();
        await prisma.streak.deleteMany();
        await prisma.user.deleteMany();

        // Create test user and token
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Streak Tester',
                email: 'tester@example.com',
                password: 'password123'
            });
        
        testUser = res.body.user;
        const cookies = res.headers['set-cookie'];
        authToken = cookies.find(cookie => cookie.startsWith('token=')).split(';')[0];
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should return initial 0 streak for new user', async () => {
        const res = await request(app)
            .get('/api/streaks')
            .set('Cookie', [authToken])
            .expect(200);

        expect(res.body).toEqual({
            current_streak: 0,
            longest_streak: 0,
            last_logged_date: null
        });
    });

    it('should retain active streak when logged yesterday', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setUTCHours(0, 0, 0, 0);

        // Seed a streak of 5 days in database
        await prisma.streak.create({
            data: {
                userId: testUser.id,
                currentStreak: 5,
                longestStreak: 8,
                lastLoggedDate: yesterday
            }
        });

        const res = await request(app)
            .get('/api/streaks')
            .set('Cookie', [authToken])
            .set('x-timezone-offset-minutes', '0')
            .expect(200);

        expect(res.body).toEqual({
            current_streak: 5,
            longest_streak: 8,
            last_logged_date: yesterday.toISOString().split('T')[0]
        });
    });

    it('should lazily reset current streak to 0 if last logged 2+ days ago', async () => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        twoDaysAgo.setUTCHours(0, 0, 0, 0);

        // Seed an expired streak
        await prisma.streak.create({
            data: {
                userId: testUser.id,
                currentStreak: 5,
                longestStreak: 8,
                lastLoggedDate: twoDaysAgo
            }
        });

        const res = await request(app)
            .get('/api/streaks')
            .set('Cookie', [authToken])
            .set('x-timezone-offset-minutes', '0')
            .expect(200);

        // Current streak should be reset, but longest streak kept
        expect(res.body).toEqual({
            current_streak: 0,
            longest_streak: 8,
            last_logged_date: twoDaysAgo.toISOString().split('T')[0]
        });

        // Verify it was updated in the DB
        const dbStreak = await prisma.streak.findUnique({
            where: { userId: testUser.id }
        });
        expect(dbStreak.currentStreak).toBe(0);
    });
});
