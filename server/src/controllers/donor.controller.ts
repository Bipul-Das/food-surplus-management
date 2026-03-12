// server/src/controllers/donor.controller.ts
import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const getDonorStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donorId = req.user?.id || (req.user as any)?.userId;
    if (!donorId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // 1. Calculate Total Pledges
    const totalDonations = await prisma.pledge.count({ 
      where: { donorId } 
    });

    // 2. Calculate This Week's Velocity
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = await prisma.pledge.count({
      where: { donorId, createdAt: { gte: oneWeekAgo } }
    });

    // 3. Aggregate Top Items mathematically
    const pledges = await prisma.pledge.findMany({
      where: { donorId },
      include: { items: { include: { category: true } } }
    });

    const itemMap: Record<string, { weight: number, unit: string }> = {};
    pledges.forEach(pledge => {
      pledge.items.forEach(item => {
        const name = item.category.name;
        if (!itemMap[name]) itemMap[name] = { weight: 0, unit: item.category.unit };
        itemMap[name].weight += item.quantity;
      });
    });

    const topItems = Object.entries(itemMap)
      .map(([name, data]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        weight: `${data.weight}${data.unit}` 
      }))
      .sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight))
      .slice(0, 3); // Return only the top 3 heavily donated items

    res.status(200).json({ 
      success: true, 
      data: { totalDonations, thisWeek, topItems } 
    });
  } catch (error) {
    next(error);
  }
};