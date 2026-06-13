import ApiError from './ApiError.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
    // Log the raw error internally for diagnostics
    logger.error({ err }, 'Express global error boundary caught an exception');

    if (err instanceof ApiError) {
        let errorCode = 'VALIDATION_ERROR';
        if (err.statusCode === 401) errorCode = 'UNAUTHORIZED';
        if (err.statusCode === 404) errorCode = 'NOT_FOUND';
        if (err.statusCode === 409) errorCode = 'CONFLICT';
        if (err.statusCode === 429) errorCode = 'RATE_LIMITED';

        return res.status(err.statusCode).json({
            error: errorCode,
            message: err.message
        });
    }

    // Prevent internal system/db leakage to client
    return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Something went wrong on our end. Please try again later.'
    });
};

export default errorHandler;