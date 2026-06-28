import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/db.js';

describe('Notifications API Integration Tests', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
        await prisma.pushSubscription.deleteMany({});
        await prisma.entry.deleteMany({});
        await prisma.streak.deleteMany({});
        await prisma.user.deleteMany({});

        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'notifications-tester@example.com' });

        authToken = res.headers['set-cookie'][0];
        const userRes = await request(app).get('/api/auth/me').set('Cookie', authToken);
        userId = userRes.body.user.id;
    });

    it('should return VAPID public key', async () => {
        const res = await request(app).get('/api/notifications/vapid-public-key');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('publicKey');
        expect(typeof res.body.publicKey).toBe('string');
    });

    it('should allow user to subscribe and unsubscribe push notifications', async () => {
        const fakeSub = {
            endpoint: 'https://fcm.googleapis.com/fcm/send/test-device-123',
            keys: {
                p256dh: 'test-p256dh-key',
                auth: 'test-auth-secret'
            }
        };

        const subRes = await request(app)
            .post('/api/notifications/subscribe')
            .set('Cookie', authToken)
            .send({ subscription: fakeSub });

        expect(subRes.status).toBe(201);
        expect(subRes.body.message).toBe('Subscribed successfully');

        const unsubRes = await request(app)
            .post('/api/notifications/unsubscribe')
            .set('Cookie', authToken)
            .send({ endpoint: fakeSub.endpoint });

        expect(unsubRes.status).toBe(200);
        expect(unsubRes.body.message).toBe('Unsubscribed successfully');
    });
});
