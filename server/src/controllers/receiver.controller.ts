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

export const getMyRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receiverId = req.user?.id || (req.user as any)?.userId;
    if (!receiverId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const requests = await prisma.foodRequest.findMany({
      where: { receiverId },
      include: {
        items: { include: { category: true } },
        pledges: {
          include: {
            donor: true,
            driver: true,
            items: { include: { category: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = requests.map((reqObj: any) => ({
      ...reqObj,
      items: reqObj.items.map((item: any) => ({
        ...item,
        food: item.category.name.charAt(0).toUpperCase() + item.category.name.slice(1),
        unit: item.category.unit
      }))
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// ========================================================
// THE GAMIFICATION NUTRITIONAL POINT MATRIX
// ========================================================
const getPointsMultiplier = (foodName: string): number => {
  const name = foodName.trim().toLowerCase();
  switch (name) {
    // Tier 1: High-Density Proteins
    case 'mutton': return 35;
    case 'beef': return 30;
    case 'fish': return 25;
    case 'chicken': return 20;
    
    // Tier 2: Dairy & Fats
    case 'milk': return 15;
    case 'cooking oil': return 12;
    
    // Tier 3: Complex Carbs & Staples
    case 'rice': return 10;
    case 'canned beans': return 6;
    
    // Tier 4: Produce & Quick Carbs
    case 'fruits': return 8;
    case 'vegetables': return 5;
    case 'bread': return 5;
    
    // Fallback for unknown categories
    default: return 5; 
  }
};

export const updatePledgeStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { pledgeId } = req.params;
    const { status } = req.body; // Expects 'COMPLETED' or 'FAILED'
    const receiverId = req.user?.id || (req.user as any)?.userId;

    const pledge = await (prisma as any).pledge.findUnique({
      where: { id: pledgeId },
      include: { request: true, items: { include: { category: true } } } // NEW: Include category for Gamification Math
    });

    if (!pledge) throw new Error("Logistics record not found.");
    if (pledge.request.receiverId !== receiverId) throw new Error("Security clearance denied.");
    if (pledge.status !== 'LOCKED') throw new Error(`Logistics already marked as ${pledge.status}.`);

    // ACID Transaction for safe state updates
    await prisma.$transaction(async (tx) => {
      
      let transactionPoints = 0;

      if (status === 'COMPLETED') {
        for (const pItem of pledge.items) {
          
          // 1. Core Logistics: Update Deficits
          const reqItem = await (tx as any).requestItem.findFirst({
            where: { requestId: pledge.requestId, categoryId: pItem.categoryId }
          });
          if (reqItem) {
            const newDeficit = Math.max(0, reqItem.deficit - pItem.quantity);
            await (tx as any).requestItem.update({
              where: { id: reqItem.id },
              data: { deficit: newDeficit }
            });
          }

          // 2. Core Gamification: Calculate Points based on Nutritional Matrix
          const multiplier = getPointsMultiplier(pItem.category.name);
          transactionPoints += Math.round(pItem.quantity * multiplier);
        }

        // 3. Inject points into Donor & Driver accounts
        if (transactionPoints > 0) {
          await tx.user.update({
            where: { id: pledge.donorId },
            data: { points: { increment: transactionPoints } }
          });
          
          await tx.user.update({
            where: { id: pledge.driverId },
            data: { points: { increment: transactionPoints } }
          });
        }
      }

      // Update the pledge status
      await (tx as any).pledge.update({
        where: { id: pledgeId },
        data: { status }
      });
    });

    res.status(200).json({ success: true, message: `Logistics status updated to ${status}. Points distributed.` });
  } catch (error) {
    next(error);
  }
};