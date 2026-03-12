// server/src/controllers/application.controller.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getPendingApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // FIX 1: Query for 'NEW' instead of 'PENDING' based on your Prisma enum
    const applications = await prisma.application.findMany({
      where: { status: 'NEW' }, 
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // FIX 2: Explicitly cast id as a string to satisfy TypeScript
    const id = req.params.id as string; 
    let { status } = req.body; 

    // Map frontend terminology to your exact Prisma schema terminology
    if (status === 'DECLINED') status = 'REJECTED';

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully.`,
      data: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};