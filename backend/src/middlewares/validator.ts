import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateBody(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
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
