"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const zod_1 = require("zod");
function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                res.status(400).json({
                    success: false,
                    message: 'Input validation failed',
                    errors: formattedErrors.map(e => `${e.field}: ${e.message}`)
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Internal validation server error',
                errors: ['Validation processing failed']
            });
        }
    };
}
