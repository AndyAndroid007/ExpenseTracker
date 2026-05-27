import { createClient } from 'redis';
import logger from '../utils/logger.js';

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
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
