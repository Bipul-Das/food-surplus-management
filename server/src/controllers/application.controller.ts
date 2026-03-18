// server/src/controllers/application.controller.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // FIX: Removed the 'where' clause so we fetch both NEW and historical applications
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' } // Puts the newest applications at the very top
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
    const id = req.params.id as string; 
    let { status } = req.body; 

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

// Add this to your application.controller.ts
export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, city, address, motivation, role } = req.body;
    
    const newApp = await prisma.application.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        city,
        address,
        motivation,
        role
      }
    });

    res.status(201).json({ success: true, data: newApp });
  } catch (error) {
    next(error);
  }
};