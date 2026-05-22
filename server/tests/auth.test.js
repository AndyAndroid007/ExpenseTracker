import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/db.js';
import jwt from 'jsonwebtoken';

describe('Authentication & User Lifecycle Integration Tests', () => {
    // Clean up the database before each individual test
    beforeEach(async () => {
        await prisma.entry.deleteMany();
        await prisma.streak.deleteMany();
        await prisma.dailyLog.deleteMany();
        await prisma.user.deleteMany();
    });

    // Cleanly close Prisma connection after all tests run
    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/auth/anonymous', () => {
        it('should successfully create an anonymous guest user and return a long-lived cookie', async () => {
            const res = await request(app)
                .post('/api/auth/anonymous')
                .expect(200);

            // Assert response structure
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.isAnonymous).toBe(true);

            // Check database existence
            const dbUser = await prisma.user.findUnique({
                where: { id: res.body.user.id }
            });
            expect(dbUser).toBeTruthy();
            expect(dbUser.email).toBeNull();
            expect(dbUser.password).toBeNull();

            // Assert cookie is present in Set-Cookie header
            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
            expect(tokenCookie).toBeDefined();
            expect(tokenCookie).toContain('HttpOnly');
            expect(tokenCookie).toContain('SameSite=Lax');
        });
    });

    describe('POST /api/auth/register', () => {
        it('should register a brand new user when unauthenticated', async () => {
            const registerData = {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: 'securepassword123'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(registerData)
                .expect(201);

            // Assert response
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.name).toBe(registerData.name);
            expect(res.body.user.email).toBe(registerData.email);
            expect(res.body.user.isAnonymous).toBe(false);

            // Verify db user
            const dbUser = await prisma.user.findUnique({
                where: { email: registerData.email }
            });
            expect(dbUser).toBeTruthy();
            expect(dbUser.name).toBe(registerData.name);

            // Verify a cookie was set
            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies.find(cookie => cookie.startsWith('token='))).toBeDefined();
        });

        it('should upgrade an existing anonymous user when authenticated with anonymous token', async () => {
            // 1. Create a guest session
            const anonRes = await request(app)
                .post('/api/auth/anonymous')
                .expect(200);

            const anonUserId = anonRes.body.user.id;
            
            // Extract the anonymous cookie
            const anonCookies = anonRes.headers['set-cookie'];
            const tokenCookie = anonCookies.find(c => c.startsWith('token='));
            const cookieString = tokenCookie.split(';')[0]; // e.g. "token=ey..."

            // 2. Perform register call with the cookie attached
            const upgradeData = {
                name: 'Upgraded User',
                email: 'upgraded@example.com',
                password: 'newsecurepassword123'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .set('Cookie', [cookieString])
                .send(upgradeData)
                .expect(201);

            // 3. Assertions
            expect(res.body.user.id).toBe(anonUserId); // The ID MUST stay the same!
            expect(res.body.user.email).toBe(upgradeData.email);
            expect(res.body.user.isAnonymous).toBe(false);

            // Verify database has been updated, not duplicated
            const dbUsers = await prisma.user.findMany();
            expect(dbUsers.length).toBe(1); // There should only be one user!
            
            const updatedUser = dbUsers[0];
            expect(updatedUser.id).toBe(anonUserId);
            expect(updatedUser.email).toBe(upgradeData.email);
            expect(updatedUser.name).toBe(upgradeData.name);
        });

        it('should fail with 409 Conflict if email is already taken', async () => {
            // Register user 1
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'First User',
                    email: 'taken@example.com',
                    password: 'password123'
                })
                .expect(201);

            // Attempt to register user 2 with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Second User',
                    email: 'taken@example.com',
                    password: 'newpassword123'
                })
                .expect(409);

            expect(res.body.message).toBe('This email is already associated with another user');
        });

        it('should fail validation with 400 Bad Request for invalid formats', async () => {
            // Test invalid email
            const invalidEmailRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Bad Email User',
                    email: 'invalid-email-address',
                    password: 'password123'
                })
                .expect(400);
            expect(invalidEmailRes.body.message).toContain('Invalid email');

            // Test short password
            const shortPasswordRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Short Password User',
                    email: 'valid@example.com',
                    password: '123'
                })
                .expect(400);
            expect(shortPasswordRes.body.message).toContain('Password should be atleast 6 characters long');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Seed a registered user
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Login User',
                    email: 'login@example.com',
                    password: 'correctpassword123'
                })
                .expect(201);
        });

        it('should log in successfully with valid credentials and return cookie', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'correctpassword123'
                })
                .expect(200);

            expect(res.body).toHaveProperty('user');
            expect(res.body.user.email).toBe('login@example.com');
            
            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies.find(cookie => cookie.startsWith('token='))).toBeDefined();
        });

        it('should fail with 401 Unauthorized for incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(res.body.message).toBe('The provided credentials are wrong.');
        });

        it('should fail with 401 Unauthorized for non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'correctpassword123'
                })
                .expect(401);

            expect(res.body.message).toBe('The provided credentials are wrong.');
        });
    });
});
