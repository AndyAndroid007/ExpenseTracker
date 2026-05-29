import { createClient } from 'redis';
import logger from '../utils/logger.js';

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries >= 5) {
                logger.warn({ retries }, 'Redis reconnection attempts exhausted. Running without Redis cache.');
                return new Error('Redis connection failed'); // Stop trying
            }
            // Wait 1 second between retry attempts
            return 1000;
        }
    }
});

client.on('error', err => {
    logger.error({ err }, 'Redis client connection error');
});

// Attempt graceful connection during startup
try {
    await client.connect();
    logger.info('Successfully connected to Redis server');
} catch (err) {
    logger.warn({ err }, 'Redis connection failed during startup. Running without Redis cache.');
}

export default client;
