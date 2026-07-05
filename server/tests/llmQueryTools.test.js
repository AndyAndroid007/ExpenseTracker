import { jest } from '@jest/globals';

const mockSendMessage = jest.fn();
const mockGenerateContent = jest.fn();

// 1. Mock the @google/generative-ai SDK globally for this test file
jest.unstable_mockModule('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: mockGenerateContent,
            startChat: jest.fn().mockReturnValue({
                sendMessage: mockSendMessage
            })
        })
    }))
}));

// 2. Import modules under test after the mock is established
const { getSpendingSummary, getTransactionsList, getStreakDetails } = await import('../src/services/queryTools.js');
const { answerQueryWithLLM } = await import('../src/services/llm.js');
const { default: prisma } = await import('../src/lib/db.js');

describe('Gemini Query Tools & LLM Function Calling Tests', () => {
    const testUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Needs to be a valid UUID

    beforeEach(async () => {
        // Clean database
        await prisma.entry.deleteMany({});
        await prisma.streak.deleteMany({});
        await prisma.user.deleteMany({});

        jest.clearAllMocks();
        process.env.GEMINI_API_KEY = 'mocked-query-key';

        // Create test user and streak
        await prisma.user.create({
            data: {
                id: testUserId,
                streak: {
                    create: {
                        currentStreak: 7,
                        longestStreak: 12,
                        lastLoggedDate: new Date('2026-06-10T00:00:00.000Z'),
                        freezesAvailable: 2
                    }
                }
            }
        });
    });

    afterAll(async () => {
        delete process.env.GEMINI_API_KEY;
        await prisma.$disconnect();
    });

    describe('getSpendingSummary Tool', () => {
        it('should fetch database aggregates and return a formatted category breakdown', async () => {
            // Seed database entries
            await prisma.entry.createMany({
                data: [
                    {
                        userId: testUserId,
                        amount: 350.50,
                        category: 'Food',
                        type: 'expense',
                        expenseDate: new Date('2026-06-05T00:00:00.000Z'),
                        rawText: 'lunch 350.50',
                        confidenceLevel: 'high'
                    },
                    {
                        userId: testUserId,
                        amount: 120.00,
                        category: 'Transport',
                        type: 'expense',
                        expenseDate: new Date('2026-06-10T00:00:00.000Z'),
                        rawText: 'uber 120',
                        confidenceLevel: 'high'
                    },
                    {
                        userId: testUserId,
                        amount: null,
                        category: 'General',
                        type: 'save_day',
                        expenseDate: new Date('2026-06-12T00:00:00.000Z'),
                        rawText: 'no spend today',
                        confidenceLevel: 'high'
                    }
                ]
            });

            const summary = await getSpendingSummary(testUserId, { from_date: '2026-06-01', to_date: '2026-06-30' });

            expect(summary.total_spend).toBe(470.50);
            expect(summary.no_spend_days).toBe(1);
            expect(summary.category_breakdown.Food).toBe(350.50);
            expect(summary.category_breakdown.Transport).toBe(120.00);
        });
    });

    describe('getTransactionsList Tool', () => {
        it('should return error if range is strictly greater than 14 days', async () => {
            const result = await getTransactionsList(testUserId, { from_date: '2026-06-01', to_date: '2026-06-20' });
            expect(result).toHaveProperty('error');
            expect(result.error).toBe('RANGE_TOO_LONG');
            expect(result.message).toContain('restricted to a maximum range of 14 days');
        });

        it('should return formatted transaction list if range is <= 14 days', async () => {
            await prisma.entry.create({
                data: {
                    userId: testUserId,
                    amount: 250,
                    category: 'Food',
                    type: 'expense',
                    expenseDate: new Date('2026-06-05T00:00:00.000Z'),
                    rawText: 'lunch 250',
                    confidenceLevel: 'high'
                }
            });

            const result = await getTransactionsList(testUserId, { from_date: '2026-06-01', to_date: '2026-06-05' });

            expect(result.transactions).toHaveLength(1);
            expect(result.transactions[0].amount).toBe(250);
            expect(result.transactions[0].category).toBe('Food');
            expect(result.transactions[0].expense_date).toBe('2026-06-05');
        });
    });

    describe('getStreakDetails Tool', () => {
        it('should retrieve streak and freeze counts correctly', async () => {
            const result = await getStreakDetails(testUserId);

            expect(result.current_streak).toBe(7);
            expect(result.longest_streak).toBe(12);
            expect(result.freezes_available).toBe(2);
            expect(result.last_logged_date).toBe('2026-06-10');
        });
    });

    describe('answerQueryWithLLM Tool Loop Orchestrator', () => {
        it('should execute function execution loop and return conversational reply', async () => {
            // Mock first reply asking for a tool execution (function call)
            mockSendMessage.mockResolvedValueOnce({
                response: {
                    functionCalls: () => [{
                        name: 'getStreakDetails',
                        args: {}
                    }],
                    text: () => ''
                }
            });

            // Mock second reply answering after receiving function result
            mockSendMessage.mockResolvedValueOnce({
                response: {
                    functionCalls: () => null,
                    text: () => 'Your current daily streak is 7 days with 2 freezes remaining!'
                }
            });

            const reply = await answerQueryWithLLM(
                testUserId,
                'What is my current streak?',
                '2026-06-11',
                0,
                'Asia/Kolkata'
            );

            expect(reply).toBe('Your current daily streak is 7 days with 2 freezes remaining!');
            expect(mockSendMessage).toHaveBeenCalledTimes(2);
        });
    });
});
