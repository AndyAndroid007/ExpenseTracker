import { logCorrection, fetchPromotableMerchants, deleteMerchant } from '../src/repositories/merchant.js';

async function test() {
    try {
        console.log('Testing UnmappedMerchant repository operations...');

        // 1. Log correction
        console.log('Logging correction for "blinkit" as "Food"...');
        let res = await logCorrection('blinkit', 'Food');
        console.log('Upsert result (insert):', res);

        // 2. Log correction again (should increment count)
        console.log('Logging correction for "blinkit" as "Food" again...');
        res = await logCorrection('blinkit', 'Food');
        console.log('Upsert result (increment):', res);
        if (res.count !== 2) {
            throw new Error(`Expected count to be 2, got ${res.count}`);
        }

        // 3. Fetch promotable merchants
        console.log('Fetching promotable merchants with threshold = 2...');
        const promotable = await fetchPromotableMerchants(2);
        console.log('Promotable list:', promotable);
        if (promotable.length === 0 || promotable[0].merchantName !== 'blinkit') {
            throw new Error('Could not retrieve "blinkit" as promotable');
        }

        // 4. Delete merchant
        console.log('Cleaning up "blinkit" from DB...');
        const deleted = await deleteMerchant('blinkit');
        console.log('Deleted record:', deleted);

        console.log('✅ ALL REPOSITORY TESTS PASSED SUCCESSFULLY!');
        process.exit(0);
    } catch (err) {
        console.error('❌ REPOSITORY TEST FAILED:', err);
        process.exit(1);
    }
}

test();
