export interface ValidationErrorItem {
  field: string;
  message: string;
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: ValidationErrorItem[];

  constructor(message: string, statusCode: number = 500, errors?: ValidationErrorItem[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: ValidationErrorItem[]): AppError {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message: string = 'Forbidden: Insufficient permissions'): AppError {
    return new AppError(message, 403);
  }

  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  static unprocessableEntity(message: string = 'Validation failed', errors?: ValidationErrorItem[]): AppError {
    return new AppError(message, 422, errors);
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500);
  }
}
