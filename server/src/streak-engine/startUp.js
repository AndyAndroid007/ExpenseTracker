import { createClient } from 'redis';

const client = createClient();

client.on('error', err => logger.error('Redis client error', err));

await client.connect();

export default client;
