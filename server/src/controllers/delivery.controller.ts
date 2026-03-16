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

// Add this to the bottom of server/src/controllers/delivery.controller.ts

export const getDeliveryHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const driverId = req.user?.id || (req.user as any)?.userId;
    if (!driverId) return res.status(401).json({ success: false, message: "Unauthorized" });

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
      // Presentation Layer Mapping: LOCKED becomes IN_TRANSIT for the UI
      const mappedStatus = d.status === 'LOCKED' ? 'IN_TRANSIT' : d.status;
      
      return {
        id: d.id,
        createdAt: d.createdAt,
        status: mappedStatus,
        receiverOrg: d.request.orgName,
        donorOrg: d.donor.organization || d.donor.name,
        items: d.items.map(i => ({
          food: i.category.name,
          quantity: i.quantity,
          unit: i.category.unit
        }))
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};