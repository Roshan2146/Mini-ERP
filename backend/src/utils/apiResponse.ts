import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message: string = 'Success',
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
    });
  }

  static error(res: Response, message: string = 'Internal Server Error', statusCode: number = 500, errors?: any[]) {
    const payload: any = {
      success: false,
      message,
    };

    if (errors && errors.length > 0) {
      payload.errors = errors;
    }

    return res.status(statusCode).json(payload);
  }
}
