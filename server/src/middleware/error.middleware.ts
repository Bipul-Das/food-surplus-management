// server/src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/HttpException';

export const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';

  console.error(`[ERROR] ${status} - ${message}`);

  res.status(status).json({
    success: false,
    message: message,
    status: status,
  });
};