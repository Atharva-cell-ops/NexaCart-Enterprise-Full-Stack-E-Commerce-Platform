import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  errors?: any;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: {
    success: boolean;
    message?: string;
    data?: T;
    meta?: ApiResponse['meta'];
    errors?: any;
  }
) => {
  return res.status(statusCode).json(payload);
};

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
) => {
  return sendResponse(res, statusCode, {
    success: true,
    message,
    data,
    meta,
  });
};

export const sendCreated = <T>(
  res: Response,
  data?: T,
  message: string = 'Resource created successfully'
) => {
  return sendResponse(res, 201, {
    success: true,
    message,
    data,
  });
};
