import prisma from '../src/lib/db.js';
import { classifyIntentLocally, getBagOfWordsKey } from '../src/parser/intentClassifier.js';
import { parseEntry } from '../src/services/entryParserOrchestrator.js';

describe('Intent Cache and Local Classifier Subsystem', () => {
    const testUserId = 'test-intent-cache-user-123';

    beforeEach(async () => {
        // Clear intent mappings seeded or created during tests
        await prisma.intentMapping.deleteMany();
    });

    afterAll(async () => {
        // Clean up database table
        await prisma.intentMapping.deleteMany();
    });

    describe('Deterministic Local Classifier', () => {
        it('should classify queries correctly based on keyword patterns', () => {
            const queries = [
                'How can i save more?',
                'Suggest saving strategies',
                'What is the general methods people follow for saving',
                'According to my spendings suggest some saving strategies',
                'What did I spend last week?'
            ];

            queries.forEach(query => {
                expect(classifyIntentLocally(query)).toBe('query');
            });
        });

        it('should classify greetings and simple conversational text as chitchat', () => {
            const chitchat = [
                'hi',
                'hello',
                'hey yo',
                'good morning'
            ];

            chitchat.forEach(text => {
                expect(classifyIntentLocally(text)).toBe('chitchat');
            });
        });

        it('should return null for normal transaction logs', () => {
            const logs = [
                'Swiggy 200',
                'Uber 150 yesterday',
                'spent 500 on groceries today'
            ];

            logs.forEach(log => {
                expect(classifyIntentLocally(log)).toBeNull();
            });
        });
    });

    describe('Bag of Words (BoW) Cache Key Generation', () => {
        it('should filter out stop words and sort tokens alphabetically', () => {
            const key1 = getBagOfWordsKey('swiggy 300 today');
            const key2 = getBagOfWordsKey('today swiggy 300');
            expect(key1).toBe('300 swiggy today');
            expect(key2).toBe('300 swiggy today'); // Order resolved alphabetically
        });

        it('should remove common prepositions and articles', () => {
            const key = getBagOfWordsKey('a coffee on the table for 150');
            // 'a', 'on', 'the', 'for' should be removed
            expect(key).toBe('150 coffee table');
        });
    });

    describe('Orchestrator Integration with Intent Cache Database', () => {
        it('should hit the database cache and return early for query/chitchat mappings', async () => {
            // Seed a mapping directly in the database
            const key = getBagOfWordsKey('custom complex suggestion message');
            await prisma.intentMapping.create({
                data: {
                    normalizedKey: key,
                    intent: 'query'
                }
            });

            // Call orchestrator with the same semantic input
            const res = await parseEntry(testUserId, 'suggestion custom complex message');
            
            // Should resolve intent immediately to query and bypass normal logging
            expect(res.intent).toBe('query');
            expect(res.confidenceLevel).toBe('high');
            expect(res.amount).toBeNull();
        });
    });
});
