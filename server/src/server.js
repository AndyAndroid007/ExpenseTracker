import 'dotenv/config';
import app from './app.js';

import logger from './utils/logger.js';
import startReminderCron from './scheduler/reminderCron.js';

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", async () => {
    logger.info(`Server up and running on ${PORT}!`);
    startReminderCron();
});
