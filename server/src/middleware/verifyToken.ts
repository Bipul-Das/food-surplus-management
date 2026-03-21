// server/src/middleware/verifyToken.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpException } from '../utils/HttpException';

// LEAD DEV FIX: Standardized the payload interface. 
// Every controller expects 'req.user.id', not 'req.user.userId'.
export interface AuthRequest extends Request {
  user?: {
    id: string;   // Normalized to 'id'
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

    if (!process.env.JWT_SECRET) {
        throw new HttpException(500, 'Server Configuration Error: Missing JWT Secret.');
    }

    // 3. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    // 4. Attach Normalized Payload to Request
    // We map 'userId' (from the raw JWT payload) to 'id' (expected by controllers)
    req.user = {
        id: decoded.userId || decoded.id, 
        role: decoded.role
    };

    next();
  } catch (error) {
    // Pass the specific error message to the global error handler
    next(new HttpException(401, 'Invalid or expired session token. Please log in again.'));
  }
};