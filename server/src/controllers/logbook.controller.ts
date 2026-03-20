// server/src/controllers/logbook.controller.ts
import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const getLogbooks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receiverId = req.user?.id || (req.user as any)?.userId;
    if (!receiverId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const now = new Date();
    const todayStart = new Date(now);
    
    // If the time is before 2:00 AM, logically it still belongs to yesterday's shift
    if (now.getHours() < 2) {
      todayStart.setDate(todayStart.getDate() - 1);
    }
    todayStart.setHours(2, 0, 0, 0); // Shift officially starts at 2:00 AM

    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayStart.getDate() + 1);
    todayEnd.setHours(1, 59, 59, 999); // Shift ends at exactly 1:59:59 AM the next day

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

export const updateTodayLogbook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string; 
    
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

    const logbook = await prisma.logbook.findUnique({ where: { id } });
    if (!logbook) throw new Error("Logbook not found.");

    // ACTION 1: Explicitly unlock dinner
    if (action === 'unlock_dinner') {
      const updated = await prisma.logbook.update({ 
        where: { id }, 
        // @ts-ignore - Bypassing aggressive TS cache.
        data: { isDinnerUnlocked: true }
      });
      return res.status(200).json({ success: true, data: updated });
    }

    // ACTION 2 & 3: Mark a meal as done and distribute Gamification Points!
    if (action === 'mark_lunch_done' || action === 'mark_dinner_done') {
      const isLunch = action === 'mark_lunch_done';
      
      // ==========================================
      // CORE GAMIFICATION: RECEIVER POINTS
      // 1 Person Fed = 5 Points
      // ==========================================
      const servedCount = isLunch ? (logbook.lunchServed || 0) : (logbook.dinnerServed || 0);
      const pointsEarned = servedCount * 5;

      const updateData = isLunch ? { isLunchComplete: true } : { isDinnerComplete: true };

      // Atomic Transaction: Lock the logbook AND award points simultaneously to ensure no data mismatches
      const [updatedLogbook] = await prisma.$transaction([
        prisma.logbook.update({ where: { id }, data: updateData }),
        prisma.user.update({
          where: { id: logbook.receiverId },
          data: { points: { increment: pointsEarned } }
        })
      ]);

      return res.status(200).json({ 
        success: true, 
        data: updatedLogbook,
        message: `Shift locked! You earned ${pointsEarned} points for feeding ${servedCount} people.`
      });
    }

    throw new Error("Invalid action.");
  } catch (error) {
    next(error);
  }
};