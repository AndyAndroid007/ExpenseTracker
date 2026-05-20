import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server up and running on ${PORT}!`);
});
