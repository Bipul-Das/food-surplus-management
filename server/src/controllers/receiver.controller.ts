// server/src/controllers/receiver.controller.ts
import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const getReceiverStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receiverId = req.user?.id || (req.user as any)?.userId;
    if (!receiverId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // 1. Calculate Total Pledges linked to this receiver's requests
    const totalReceived = await prisma.pledge.count({
      where: { request: { receiverId } }
    });

    // 2. Calculate This Week's Pledges
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = await prisma.pledge.count({
      where: { request: { receiverId }, createdAt: { gte: oneWeekAgo } }
    });

    // 3. Aggregate Received Items and Calculate Impact
    const pledges = await prisma.pledge.findMany({
      where: { request: { receiverId } },
      include: { items: { include: { category: true } } }
    });

    let totalWeightKg = 0;
    const itemMap: Record<string, { weight: number, unit: string }> = {};

    pledges.forEach(pledge => {
      pledge.items.forEach(item => {
        const name = item.category.name;
        if (!itemMap[name]) itemMap[name] = { weight: 0, unit: item.category.unit };
        itemMap[name].weight += item.quantity;

        // Metric Engine: Calculate total mass for impact tracking
        if (item.category.unit.toLowerCase() === 'kg' || item.category.unit.toLowerCase() === 'liters') {
          totalWeightKg += item.quantity;
        }
      });
    });

    // Heuristic: Assume ~0.5kg of gross food mass equals 1 person fed
    const peopleFed = Math.round(totalWeightKg * 2);

    const topItems = Object.entries(itemMap)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        weight: `${data.weight}${data.unit}`
      }))
      .sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight))
      .slice(0, 3); // Top 3 items

    res.status(200).json({
      success: true,
      data: { totalReceived, thisWeek, peopleFed, topItems }
    });
  } catch (error) {
    next(error);
  }
};