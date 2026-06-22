import prisma from '../lib/db.js';

/**
 * Upserts a merchant correction in the database.
 * If the merchantName exists, increments the frequency count and updates the suggested category.
 * If not, creates a new entry with count = 1.
 * 
 * @param {string} merchantName - The unmapped merchant name
 * @param {string} categorySuggest - The user-corrected category
 * @returns {Promise<object>} The upserted record details
 */
export const logCorrection = async (merchantName, categorySuggest) => {
    return await prisma.unmappedMerchant.upsert({
        where: { merchantName },
        update: {
            count: { increment: 1 },
            categorySuggest
        },
        create: {
            merchantName,
            categorySuggest,
            count: 1
        }
    });
};

/**
 * Retrieves unmapped merchants meeting or exceeding a correction frequency threshold.
 * 
 * @param {number} threshold - The minimum number of corrections required
 * @returns {Promise<Array>} List of promotable merchants
 */
export const fetchPromotableMerchants = async (threshold = 3) => {
    return await prisma.unmappedMerchant.findMany({
        where: {
            count: { gte: threshold }
        },
        orderBy: {
            count: 'desc'
        }
    });
};

/**
 * Deletes an unmapped merchant record (typically run after promotion).
 * 
 * @param {string} merchantName - The merchant name to remove
 * @returns {Promise<object>} The deleted record details
 */
export const deleteMerchant = async (merchantName) => {
    return await prisma.unmappedMerchant.delete({
        where: { merchantName }
    });
};
