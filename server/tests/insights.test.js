import { jest } from '@jest/globals';

const mockGenerateContent = jest.fn();

// Mock GoogleGenerativeAI globally for this test file
jest.unstable_mockModule('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: mockGenerateContent
        })
    }))
}));

// Import after the mock is established
const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');
const { default: prisma } = await import('../src/lib/db.js');

describe('Weekly/Monthly/Yearly Insights API Integration Tests', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
        // Clean database
        await prisma.entry.deleteMany();
        await prisma.streak.deleteMany();
        await prisma.user.deleteMany();

        jest.clearAllMocks();
        process.env.GEMINI_API_KEY = 'mocked-insights-key';

        // Create test user and token
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Insights Tester',
                email: 'insights@example.com',
                password: 'password123'
            });
        
        testUser = res.body.user;
        const cookies = res.headers['set-cookie'];
        authToken = cookies.find(cookie => cookie.startsWith('token=')).split(';')[0];
    });

    afterAll(async () => {
        delete process.env.GEMINI_API_KEY;
        await prisma.$disconnect();
    });

    it('should return low confidence rating if user has < 3 logs in the period', async () => {
        // Log just one expense
        await prisma.entry.create({
            data: {
                userId: testUser.id,
                rawText: 'Swiggy 200',
                amount: 200,
                category: 'Food',
                type: 'expense',
                confidenceLevel: 'high',
                expenseDate: new Date()
            }
        });

        const res = await request(app)
            .get('/api/insights/weekly')
            .set('Cookie', [authToken])
            .set('x-timezone-offset-minutes', '0')
            .expect(200);

        expect(res.body.data_confidence).toBe('low');
        expect(res.body.insights[0]).toContain('Log at least 3 entries');
        expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('should calculate aggregated spend, categories, no-spends, and trigger Gemini insights', async () => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Seed 3 entries (to cross confidence threshold)
        await prisma.entry.createMany({
            data: [
                {
                    userId: testUser.id,
                    rawText: 'Swiggy 200',
                    amount: 200,
                    category: 'Food',
                    type: 'expense',
                    confidenceLevel: 'high',
                    expenseDate: today
                },
                {
                    userId: testUser.id,
                    rawText: 'Uber 150',
                    amount: 150,
                    category: 'Transport',
                    type: 'expense',
                    confidenceLevel: 'high',
                    expenseDate: today
                },
                {
                    userId: testUser.id,
                    rawText: 'no spend today',
                    amount: null,
                    category: null,
                    type: 'no_spend',
                    confidenceLevel: 'high',
                    expenseDate: today
                }
            ]
        });

        // Mock Gemini success response
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify([
                    "You kept food spend in check! 🍔",
                    "A perfect no-spend day achieved! 🔥",
                    "Tip: Save the ₹150 transport money tomorrow! 💰"
                ])
            }
        });

        const res = await request(app)
            .get('/api/insights/weekly')
            .set('Cookie', [authToken])
            .set('x-timezone-offset-minutes', '0')
            .expect(200);

        expect(res.body.total_spend).toBe(350);
        expect(res.body.no_spend_days).toBe(1);
        expect(res.body.save_days).toBe(0);
        expect(res.body.top_category).toBe('Food');
        expect(res.body.category_breakdown).toEqual({
            Food: 200,
            Transport: 150
        });
        expect(res.body.data_confidence).toBe('high');
        expect(res.body.insights).toEqual([
            "You kept food spend in check! 🍔",
            "A perfect no-spend day achieved! 🔥",
            "Tip: Save the ₹150 transport money tomorrow! 💰"
        ]);
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should fall back gracefully to local heuristic insights if Gemini fails', async () => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Seed 3 entries
        await prisma.entry.createMany({
            data: [
                {
                    userId: testUser.id,
                    rawText: 'Swiggy 200',
                    amount: 200,
                    category: 'Food',
                    type: 'expense',
                    confidenceLevel: 'high',
                    expenseDate: today
                },
                {
                    userId: testUser.id,
                    rawText: 'Uber 150',
                    amount: 150,
                    category: 'Transport',
                    type: 'expense',
                    confidenceLevel: 'high',
                    expenseDate: today
                },
                {
                    userId: testUser.id,
                    rawText: 'no spend today',
                    amount: null,
                    category: null,
                    type: 'no_spend',
                    confidenceLevel: 'high',
                    expenseDate: today
                }
            ]
        });

        // Mock Gemini throwing an error
        mockGenerateContent.mockRejectedValue(new Error('Rate Limit Exceeded'));

        const res = await request(app)
            .get('/api/insights/weekly')
            .set('Cookie', [authToken])
            .set('x-timezone-offset-minutes', '0')
            .expect(200);

        expect(res.body.total_spend).toBe(350);
        expect(res.body.data_confidence).toBe('high');
        // Expect local heuristic fallback strings
        expect(res.body.insights[0]).toContain('logged 1 no-spend days');
        expect(res.body.insights[1]).toContain('Food was your top spending category');
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should return 400 Bad Request for an invalid period parameter', async () => {
        await request(app)
            .get('/api/insights/invalid_period')
            .set('Cookie', [authToken])
            .expect(400);
    });
});
