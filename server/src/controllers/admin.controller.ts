// server/src/controllers/admin.controller.ts
import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const getSystemStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Calculate Total Users
    const totalUsers = await prisma.user.count();

    // 2. Calculate Users by Role
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    // 3. Calculate Active Requests (OPEN or PARTIAL)
    const activeRequests = await prisma.foodRequest.count({
      where: { status: { in: ['OPEN', 'PARTIAL'] } }
    });

    // 4. Calculate Fulfilled Requests
    const fulfilledRequests = await prisma.foodRequest.count({
      where: { status: 'FULFILLED' }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        roles: roleStats,
        activeRequests,
        fulfilledRequests
      }
    });
  } catch (error) {
    next(error);
  }
};