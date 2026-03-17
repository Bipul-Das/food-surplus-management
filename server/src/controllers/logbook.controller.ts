// server/src/controllers/logbook.controller.ts
import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const getLogbooks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receiverId = req.user?.id || (req.user as any)?.userId;
    if (!receiverId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let todayLog = await prisma.logbook.findFirst({
      where: { receiverId, date: { gte: todayStart, lte: todayEnd } }
    });

    if (!todayLog) {
      todayLog = await prisma.logbook.create({
        data: { receiverId, lunchEstimated: 0, date: new Date() }
      });
    }

    const history = await prisma.logbook.findMany({
      where: { receiverId, date: { lt: todayStart } },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ success: true, data: { today: todayLog, history } });
  } catch (error) {
    next(error);
  }
};

// Replace this function in server/src/controllers/logbook.controller.ts

export const updateTodayLogbook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string; 
    
    // FIX: Destructure ONLY the editable fields. 
    // Prisma will crash if we try to update system fields like `createdAt`.
    const { 
      lunchEstimated, lunchServed, lunchMeal, 
      dinnerEstimated, dinnerServed, dinnerMeal 
    } = req.body;

    const updated = await prisma.logbook.update({
      where: { id },
      data: {
        lunchEstimated: lunchEstimated !== null && lunchEstimated !== undefined ? Number(lunchEstimated) : 0,
        lunchServed: lunchServed !== null && lunchServed !== undefined ? Number(lunchServed) : null,
        lunchMeal: lunchMeal || null,
        dinnerEstimated: dinnerEstimated !== null && dinnerEstimated !== undefined ? Number(dinnerEstimated) : null,
        dinnerServed: dinnerServed !== null && dinnerServed !== undefined ? Number(dinnerServed) : null,
        dinnerMeal: dinnerMeal || null
      }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const handleLogbookAction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string; 
    const { action } = req.body; // 'mark_lunch_done' | 'mark_dinner_done' | 'unlock_dinner'
    const receiverId = req.user?.id || (req.user as any)?.userId;

    const logbook = await prisma.logbook.findUnique({ where: { id } });
    if (!logbook) throw new Error("Logbook not found.");

    // ACTION 1: Explicitly unlock dinner
    if (action === 'unlock_dinner') {
        
      const updated = await prisma.logbook.update({ 
        where: { id }, 
        // @ts-ignore - Bypassing aggressive TS cache. The column exists in DB.
        data: { isDinnerUnlocked: true } // The red line here will be gone!
      });
      return res.status(200).json({ success: true, data: updated });
    }

    // ACTION 2 & 3: Mark a meal as done (Requires Staleness Check)
    if (action === 'mark_lunch_done' || action === 'mark_dinner_done') {
      const unloggedCount = await prisma.pledge.count({
        where: {
          request: { receiverId },
          status: 'COMPLETED',
          updatedAt: { gt: logbook.updatedAt } // Found donations received AFTER last book update
        }
      });

      if (unloggedCount > 0) {
        return res.status(200).json({ 
          success: false, 
          requiresUpdate: true, 
          unloggedCount,
          message: `You have received donation ${unloggedCount} times after the last update. You must update your logbook.`
        });
      }

      // If clean, lock it permanently
      const updateData = action === 'mark_lunch_done' 
        ? { isLunchComplete: true } 
        : { isDinnerComplete: true };

      const updated = await prisma.logbook.update({ where: { id }, data: updateData });
      return res.status(200).json({ success: true, data: updated });
    }

    throw new Error("Invalid action.");
  } catch (error) {
    next(error);
  }
};