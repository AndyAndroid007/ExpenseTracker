import ApiError from "../exceptions/ApiError.js";

export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const validated = await schema.parseAsync(req.body);

            req.body = validated;

            next();
        } catch (error) {
            const firstError = error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation Error';
            return next(new ApiError(400, firstError));
        }
    };
};

export default validate;