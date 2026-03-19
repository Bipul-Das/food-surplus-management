// server/src/controllers/profile.controller.ts
import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const getPublicProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profileId = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        name: true,
        organization: true,
        role: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        website: true,
        avatar: true,
        createdAt: true,
        isActive: true // NEW: Explicitly expose the Operational Status to the Public Profile
      }
    });

    if (!user) return res.status(404).json({ success: false, message: "Profile not found." });

    // Enforce Lockout: Lead Devs and Coordinators do not have public profiles
    if (user.role === 'LEAD_DEV' || user.role === 'COORDINATOR') {
      return res.status(403).json({ success: false, message: "you don't have access to this page", isLockedOut: true });
    }

    let profileData: any = { user };

    // ==========================================
    // ROLE: RECEIVER DATA PAYLOAD
    // ==========================================
    if (user.role === 'RECEIVER') {
      const receivingHistoryRaw = await prisma.pledge.findMany({
        where: { request: { receiverId: profileId }, status: 'COMPLETED' },
        include: { donor: true, items: { include: { category: true } } },
        orderBy: { updatedAt: 'desc' }
      });
      profileData.receivingHistory = receivingHistoryRaw.map((p: any) => ({
        id: p.id,
        date: p.updatedAt,
        donorName: p.donor.organization || p.donor.name,
        items: p.items.map((i: any) => ({ food: i.category.name, quantity: i.quantity, unit: i.category.unit }))
      }));

      const activeRequestsRaw = await prisma.foodRequest.findMany({
        where: { receiverId: profileId },
        include: { items: { include: { category: true } } },
        orderBy: { createdAt: 'desc' }
      });
      profileData.activeRequests = activeRequestsRaw.filter((req: any) => {
        const totalDeficit = req.items.reduce((sum: number, item: any) => sum + item.deficit, 0);
        return totalDeficit > 0;
      }).map((req: any) => ({
        id: req.id,
        urgency: req.urgency,
        createdAt: req.createdAt,
        items: req.items.map((i: any) => ({ food: i.category.name, deficit: i.deficit, unit: i.category.unit }))
      }));

      profileData.logbooks = await prisma.logbook.findMany({
        where: { receiverId: profileId, OR: [{ isLunchComplete: true }, { isDinnerComplete: true }] },
        orderBy: { date: 'desc' }
      });
    }

    // ==========================================
    // ROLE: DELIVERY_MAN DATA PAYLOAD
    // ==========================================
    else if (user.role === 'DELIVERY_MAN') {
      const deliveryHistoryRaw = await prisma.pledge.findMany({
        where: { driverId: profileId, status: 'COMPLETED' },
        include: { request: true, items: { include: { category: true } } },
        orderBy: { updatedAt: 'desc' }
      });
      profileData.deliveryHistory = deliveryHistoryRaw.map((p: any) => ({
        id: p.id,
        date: p.updatedAt,
        receiverName: p.request.orgName,
        items: p.items.map((i: any) => ({ food: i.category.name, quantity: i.quantity, unit: i.category.unit }))
      }));
    }

    // ==========================================
    // ROLE: DONOR DATA PAYLOAD
    // ==========================================
    else if (user.role === 'DONOR') {
      const donationHistoryRaw = await prisma.pledge.findMany({
        where: { donorId: profileId, status: 'COMPLETED' },
        include: { request: true, items: { include: { category: true } } },
        orderBy: { updatedAt: 'desc' }
      });
      profileData.donationHistory = donationHistoryRaw.map((p: any) => ({
        id: p.id,
        date: p.updatedAt,
        receiverName: p.request.orgName,
        items: p.items.map((i: any) => ({ food: i.category.name, quantity: i.quantity, unit: i.category.unit }))
      }));

      const activeInventoryRaw = await prisma.surplusInventory.findMany({
        where: { donorId: profileId, currentQuantity: { gt: 0 } },
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      });
      profileData.activeInventory = activeInventoryRaw.map((inv: any) => ({
        id: inv.id,
        food: inv.category.name,
        quantity: inv.currentQuantity,
        unit: inv.category.unit,
        expDate: inv.expiryDate,
        batch: inv.batchNumber
      }));
    }

    res.status(200).json({ success: true, data: profileData });
  } catch (error) {
    next(error);
  }
};