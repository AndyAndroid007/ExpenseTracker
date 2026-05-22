import express from 'express';
import cors from 'cors'
import masterRouter from './routes/index.js';
import cookieParser from 'cookie-parser';
import errorHandler from './exceptions/errorHandler.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api',masterRouter);

app.get('/health',(req, res) => {
    res.status(200).send('Health Check Successful!');
});

app.use(errorHandler);

export default app;
