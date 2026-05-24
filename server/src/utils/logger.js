import pino from 'pino';

// Configure the pino multi-transport targets (running in worker threads)
const transport = pino.transport({
    targets: [
        // Target 1: Color-coded pretty output in the console terminal
        {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            }
        },
        // Target 2: High-performance daily rotating file logger (raw JSON)
        {
            target: 'pino-roll',
            options: {
                file: './logs/app', // Generates ./logs/app-YYYY-MM-DD.log
                frequency: 'daily',
                mkdir: true,
                keep: {
                    count: 7 // Prunes files automatically to keep a 7-day TTL history
                }
            }
        }
    ]
});

// Trace level captures everything: trace < debug < info < warn < error
const defaultLevel = process.env.NODE_ENV === 'production' ? 'info' : 'trace';

export const logger = pino({
    level: defaultLevel,
}, transport);

export default logger;
