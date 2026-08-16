import prisma from '../lib/db.js';

/**
 * Retrieve a cached intent mapping by its normalized Bag of Words key.
 * @param {string} normalizedKey 
 * @returns {Promise<object|null>}
 */
export const getIntentMapping = async (normalizedKey) => {
    return await prisma.intentMapping.findUnique({
        where: {
            normalizedKey
        }
    });
};

/**
 * Cache a resolved intent mapping using an upsert to prevent duplicate key race conditions.
 * @param {string} normalizedKey 
 * @param {string} intent 
 * @returns {Promise<object>}
 */
export const createIntentMapping = async (normalizedKey, intent) => {
    return await prisma.intentMapping.upsert({
        where: {
            normalizedKey
        },
        create: {
            normalizedKey,
            intent
        },
        update: {
            intent
        }
    });
};
