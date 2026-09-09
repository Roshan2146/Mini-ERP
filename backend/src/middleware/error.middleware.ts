import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    statusCode: err.statusCode,
  });

  // Custom AppError
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Prisma Unique Constraint Violation
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'Field';
    return ApiResponse.error(res, `A record with this ${target} already exists.`, 409);
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    return ApiResponse.error(res, 'Requested record was not found.', 404);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token. Please authenticate again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token has expired. Please log in again.', 401);
  }

  // JSON Syntax Error in request body
  if (err instanceof SyntaxError && 'body' in err) {
    return ApiResponse.error(res, 'Malformed JSON in request body.', 400);
  }

  // Default Fallback
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';
  return ApiResponse.error(res, message, 500);
};
