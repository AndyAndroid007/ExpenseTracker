import { extractUnmappedMerchant } from '../src/parser/merchant.js';

describe('Unrecognized Merchant Extraction Unit Tests', () => {
    it('should return null if category is not General', () => {
        expect(extractUnmappedMerchant('spent 200 on swiggy', 'Food')).toBeNull();
        expect(extractUnmappedMerchant('uber 150', 'Transport')).toBeNull();
    });

    it('should extract unrecognized merchant names correctly', () => {
        // Preposition patterns
        expect(extractUnmappedMerchant('spent 200 on blinkit', 'General')).toBe('blinkit');
        expect(extractUnmappedMerchant('paid 500 to zepto', 'General')).toBe('zepto');
        expect(extractUnmappedMerchant('100 at blue_tokai', 'General')).toBe('blue_tokai');
        expect(extractUnmappedMerchant('subscription for zoom 1000', 'General')).toBe('zoom');

        // Multi-word merchant name extraction
        expect(extractUnmappedMerchant('spent 350 on original combo', 'General')).toBe('original combo');
        expect(extractUnmappedMerchant('paid 150 to blue tokai', 'General')).toBe('blue tokai');

        // Direct patterns
        expect(extractUnmappedMerchant('blinkit 150', 'General')).toBe('blinkit');
    });

    it('should filter out stop words and numbers', () => {
        expect(extractUnmappedMerchant('spent 500 rs', 'General')).toBeNull();
        expect(extractUnmappedMerchant('paid 200 rupees today', 'General')).toBeNull();
        expect(extractUnmappedMerchant('approx 1000', 'General')).toBeNull();
    });

    it('should filter out known category keywords', () => {
        expect(extractUnmappedMerchant('lunch 200', 'General')).toBeNull();
        expect(extractUnmappedMerchant('spent 100 on medicine', 'General')).toBeNull();
    });
});
