// server/src/middleware/verifyToken.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpException } from '../utils/HttpException';

// Extend Express Request interface to include our custom user payload
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Extract Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException(401, 'Access denied. No token provided.');
    }

    // 2. Extract Token (Remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new HttpException(401, 'Access denied. Invalid token format.');
    }

    // 3. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // 4. Attach Payload to Request
    req.user = decoded as { userId: string; role: string };

    next();
  } catch (error) {
    next(new HttpException(401, 'Invalid or expired token.'));
  }
};