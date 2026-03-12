// server/src/controllers/delivery.controller.ts
import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const getMyDeliveries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const driverId = req.user?.id || (req.user as any)?.userId;
    if (!driverId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Fetch all pledges locked to this specific driver
    const deliveries = await prisma.pledge.findMany({
      where: { driverId },
      include: {
        request: true,
        donor: true,
        items: { include: { category: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = deliveries.map(d => {
      // Create the string: "5kg rice + 5kg chicken"
      const itemsString = d.items.map(i => `${i.quantity}${i.category.unit} ${i.category.name}`).join(' + ');
      
      return {
        id: d.id,
        status: d.status,
        donorName: d.donor.organization || d.donor.name,
        receiverName: d.request.orgName,
        details: `Deliver to ${d.request.orgName} from ${d.donor.organization || d.donor.name}`,
        payload: itemsString,
        createdAt: d.createdAt
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};