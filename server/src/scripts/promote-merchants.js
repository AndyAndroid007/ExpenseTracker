import { fetchPromotableMerchants, deleteMerchant } from '../repositories/merchant.js';
import logger from '../utils/logger.js';
import readline from 'readline';

const threshold = parseInt(process.argv[2], 10) || 3;

async function main() {
    console.log(`\n🔍 Fetching unmapped merchants with frequency >= ${threshold}...`);
    try {
        const merchants = await fetchPromotableMerchants(threshold);
        if (merchants.length === 0) {
            console.log('✅ No unmapped merchants currently cross the threshold for promotion.\n');
            process.exit(0);
        }

        console.log('\n📣 PROPOSED MERCHANT PROMOTIONS:');
        console.log('================================');
        merchants.forEach(m => {
            console.log(`👉 Add "${m.merchantName}" to CATEGORY_KEYWORDS.${m.categorySuggest} (${m.count} corrections logged)`);
        });
        console.log('================================\n');
        console.log('Instructions: Copy the merchant names above and paste them into the appropriate category lists in:');
        console.log('👉 server/src/parser/categories.js\n');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Would you like to clear these promoted merchants from the unmapped tracking database? (yes/no): ', async (answer) => {
            const normalized = answer.trim().toLowerCase();
            if (normalized === 'yes' || normalized === 'y') {
                console.log('\n🧹 Clearing unmapped merchants from DB...');
                for (const m of merchants) {
                    await deleteMerchant(m.merchantName);
                    console.log(`🗑️  Deleted: "${m.merchantName}"`);
                }
                console.log('✅ Cleanup complete.\n');
            } else {
                console.log('\n⚠️ Keeping unmapped merchants in tracking database.\n');
            }
            rl.close();
            process.exit(0);
        });

    } catch (err) {
        console.error('❌ Error executing merchant promotion script:', err);
        process.exit(1);
    }
}

main();
