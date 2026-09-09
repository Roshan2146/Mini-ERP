import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiResponse } from '../utils/apiResponse';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body || req.body;
      req.query = (parsed.query as any) || req.query;
      req.params = (parsed.params as any) || req.params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map((err) => ({
          field: err.path.length > 1 ? err.path.slice(1).join('.') : err.path.join('.'),
          message: err.message,
        }));

        return ApiResponse.error(res, 'Validation failed', 422, errorDetails);
      }
      return next(error);
    }
  };
};
