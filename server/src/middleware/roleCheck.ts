// server/src/middleware/roleCheck.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyToken'; // Import the interface we extended earlier
import { HttpException } from '../utils/HttpException';

/**
 * Higher-Order Middleware to enforce Role-Based Access Control (RBAC).
 * @param allowedRoles Array of roles permitted to access the route.
 */
export const roleCheck = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Safety Check: Ensure verifyToken ran first
    if (!req.user) {
      return next(new HttpException(401, 'Access denied. User identity missing.'));
    }

    const userRole = req.user.role;

    // 2. 👑 GOD MODE OVERRIDE
    // The Lead Developer bypasses ALL role restrictions.
    if (userRole === 'LEAD_DEV') {
      return next();
    }

    // 3. Strict Role Verification
    if (!allowedRoles.includes(userRole)) {
      console.warn(`[SECURITY] Blocked ${userRole} from accessing restricted route.`);
      return next(new HttpException(403, 'Access denied. Insufficient permissions.'));
    }

    // 4. Access Granted
    next();
  };
};