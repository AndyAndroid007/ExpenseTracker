import parseMessage from '../src/parser/index.js';
import { getLocalDateString } from '../src/parser/dates.js';

describe('Modular Parsing Engine Unit Tests', () => {
    describe('Entry Type Detection', () => {
        it('should classify zero/no spend variations as save_day', () => {
            const inputs = [
                'no spend today',
                'zero spend!',
                '0 spend yesterday',
                'I did not spend anything today',
                "didn't spend today"
            ];
            inputs.forEach(input => {
                const res = parseMessage(input);
                expect(res.type).toBe('save_day');
                expect(res.amount).toBeNull();
            });
        });

        it('should classify saving variations as save_day', () => {
            const inputs = [
                'saved today',
                'save-day',
                'saved 500 bucks',
                'save money',
                'saved today 1000'
            ];
            inputs.forEach(input => {
                const res = parseMessage(input);
                expect(res.type).toBe('save_day');
            });
        });

        it('should classify standard sentences as expenses by default', () => {
            const res = parseMessage('Coffee 150');
            expect(res.type).toBe('expense');
            expect(res.amount).toBe(150);
        });
    });

    describe('Amount Extraction & Formatting Resolver', () => {
        it('should extract correct amounts with various currency symbols', () => {
            expect(parseMessage('₹250 on food').amount).toBe(250);
            expect(parseMessage('Spent rs. 150.50 on transportation').amount).toBe(150.50);
            expect(parseMessage('dinner 200.75usd').amount).toBe(200.75);
            expect(parseMessage('shopping 1,000 INR').amount).toBe(1000);
            expect(parseMessage('Coffee cost 120 bucks').amount).toBe(120);
        });

        it('should handle standard thousands and decimal commas correctly', () => {
            // Thousands comma
            expect(parseMessage('Rent 15,500').amount).toBe(15500);
            // European decimal comma (e.g. 150,50 -> exactly 2 decimal digits at end)
            expect(parseMessage('Coffee 150,50').amount).toBe(150.50);
            // Both commas and dots
            expect(parseMessage('Bought laptop for 1,250.99').amount).toBe(1250.99);
            expect(parseMessage('Spent 1.250,99 in Europe').amount).toBe(1250.99);
        });

        it('should return null when amount is missing or invalid', () => {
            expect(parseMessage('Coffee today').amount).toBeNull();
        });
    });

    describe('Category Matching', () => {
        it('should map Swiggy/Zomato/Cafe to Food', () => {
            expect(parseMessage('Swiggy 300').category).toBe('Food');
            expect(parseMessage('Coffee at starbucks 180').category).toBe('Food');
        });

        it('should map Uber/Ola/Petrol to Transport', () => {
            expect(parseMessage('Uber 250').category).toBe('Transport');
            expect(parseMessage('petrol cost 1000').category).toBe('Transport');
        });

        it('should map rent/electricity to Bills', () => {
            expect(parseMessage('electricity bill 2500').category).toBe('Bills');
        });

        it('should default to General if no category keyword matches', () => {
            expect(parseMessage('spent 500 on random things').category).toBe('General');
        });
    });

    describe('Timezone-aware Date Parsing', () => {
        const offset = -330; // IST UTC+5:30

        it('should parse yesterday, today, and tomorrow correctly', () => {
            expect(parseMessage('Swiggy 250 yesterday', offset).expenseDate).toBe(getLocalDateString(offset, -1));
            expect(parseMessage('Coffee 150 today', offset).expenseDate).toBe(getLocalDateString(offset, 0));
            expect(parseMessage('Rent tomorrow 5000', offset).expenseDate).toBe(getLocalDateString(offset, 1));
        });

        it('should parse complex relative offsets correctly', () => {
            expect(parseMessage('food 350 2 days ago', offset).expenseDate).toBe(getLocalDateString(offset, -2));
            expect(parseMessage('before 3 days spent 1000', offset).expenseDate).toBe(getLocalDateString(offset, -3));
            expect(parseMessage('2 days after logged 400', offset).expenseDate).toBe(getLocalDateString(offset, 2));
            expect(parseMessage('food 350 day before yesterday', offset).expenseDate).toBe(getLocalDateString(offset, -2));
            expect(parseMessage('food 350 3 days before yesterday', offset).expenseDate).toBe(getLocalDateString(offset, -4));
        });
    });

    describe('Confidence Level Scoring', () => {
        it('should score high for zero spend', () => {
            expect(parseMessage('no spend today').confidenceLevel).toBe('high');
        });

        it('should score high for expense with explicit date and amount', () => {
            expect(parseMessage('Uber 300 yesterday').confidenceLevel).toBe('high');
        });

        it('should score medium for expense with amount but implicit date', () => {
            expect(parseMessage('Uber 300').confidenceLevel).toBe('medium');
        });

        it('should score low for expense with missing amount', () => {
            expect(parseMessage('Uber yesterday').confidenceLevel).toBe('low');
        });

        it('should score low when both category and date are missing (2+ missing fields downgrade)', () => {
            expect(parseMessage('spent 500').confidenceLevel).toBe('low');
        });
    });
});
