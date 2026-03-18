// server/src/controllers/request.controller.ts
import { Response, NextFunction, Request } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const createPledge = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requestId = req.params.id as string;
    const { pledgeAmounts, driverId } = req.body; 
    
    const donorId = req.user?.id || (req.user as any)?.userId;
    if (!donorId) return res.status(401).json({ success: false, message: "Unauthorized." });

    if (!driverId) {
      return res.status(400).json({ success: false, message: "Telemetry Error: Frontend did not send a driverId." });
    }

    const cleanDriverId = String(driverId).trim().toLowerCase();

    const driver = await (prisma as any).user.findFirst({ 
      where: { id: cleanDriverId } 
    });
    
    if (!driver || driver.role !== 'DELIVERY_MAN') {
      return res.status(400).json({ success: false, message: `Telemetry Error: Invalid Delivery Man.` });
    }

    const existingPledge = await (prisma as any).pledge.findFirst({
      where: { requestId, donorId }
    });
    
    if (existingPledge) {
      return res.status(400).json({ success: false, message: "Transaction Denied: You have already committed a pledge." });
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      const pledgeItemsData: any[] = [];

      for (const [foodName, quantity] of Object.entries(pledgeAmounts as Record<string, number>)) {
        const pledgeQty = Number(quantity);
        if (pledgeQty <= 0) continue;

        const category = await tx.foodCategory.findUnique({ where: { name: foodName.toLowerCase() } });
        if (!category) throw new Error(`System Error: Category ${foodName} unrecognized.`);

        const requestItem = await (tx as any).requestItem.findFirst({
          where: { requestId, categoryId: category.id }
        });
        
        if (!requestItem) throw new Error(`Transaction Denied: Receiver did not request ${foodName}.`);
        if (pledgeQty > requestItem.deficit) throw new Error(`Transaction Denied: Cannot pledge more than deficit.`);

        const inventoryBatches = await tx.surplusInventory.findMany({
          where: { donorId, categoryId: category.id },
          orderBy: { expiryDate: 'asc' } 
        });

        const totalAvailable = inventoryBatches.reduce((sum, batch) => sum + batch.currentQuantity, 0);
        if (pledgeQty > totalAvailable) {
          throw new Error(`Transaction Denied: Insufficient inventory for ${foodName}.`);
        }

        let remainingToDeduct = pledgeQty;
        for (const batch of inventoryBatches) {
          if (remainingToDeduct <= 0) break;

          if (batch.currentQuantity <= remainingToDeduct) {
            await tx.surplusInventory.delete({ where: { id: batch.id } });
            remainingToDeduct -= batch.currentQuantity;
          } else {
            await tx.surplusInventory.update({
              where: { id: batch.id },
              data: { currentQuantity: batch.currentQuantity - remainingToDeduct }
            });
            remainingToDeduct = 0;
          }
        }

        // Deficit drops on pledge to prevent over-donating
        await (tx as any).requestItem.update({
          where: { id: requestItem.id },
          data: { deficit: requestItem.deficit - pledgeQty }
        });

        pledgeItemsData.push({ categoryId: category.id, quantity: pledgeQty });
      }

      if (pledgeItemsData.length === 0) throw new Error("Transaction Denied: No valid quantities.");

      const newPledge = await (tx as any).pledge.create({
        data: {
          requestId, donorId, driverId: cleanDriverId, status: "LOCKED",
          items: { create: pledgeItemsData }
        }
      });

      return newPledge;
    });

    res.status(201).json({ success: true, message: "Pledge successfully locked.", data: transactionResult });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Allocation failed." });
  }
};

export const getActiveRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requests = await prisma.foodRequest.findMany({
      include: { 
        items: { include: { category: true } },
        // NEW: We must include pledges so frontend can calculate PHYSICAL RECEIPT progress
        pledges: { include: { donor: true, driver: true, items: { include: { category: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const now = new Date();
    const processedRequests = [];

    for (const reqObj of requests) {
      let currentStatus: string = reqObj.status;

      if (currentStatus === 'OPEN' || currentStatus === 'PARTIAL') {
        
        // FULFILLED is now strictly calculated based on COMPLETED physical receipt
        const completedPledges = reqObj.pledges?.filter((p: any) => p.status === 'COMPLETED') || [];
        const isFulfilled = reqObj.items.length > 0 && reqObj.items.every((item: any) => {
          const demanded = item.initialQuantity || item.deficit || 0;
          const received = completedPledges.reduce((sum: number, p: any) => {
            const pItem = p.items.find((pi: any) => pi.categoryId === item.categoryId);
            return sum + (pItem ? pItem.quantity : 0);
          }, 0);
          return received >= demanded;
        });

        const isPartial = reqObj.items.some((i: any) => i.deficit < i.initialQuantity) && !isFulfilled;
        
        let isExpired = false;
        if (!isFulfilled && reqObj.requiredWithin) {
          const [hours, minutes] = reqObj.requiredWithin.split(':').map(Number);
          const expiryTime = new Date(reqObj.createdAt);
          expiryTime.setHours(expiryTime.getHours() + (hours || 0));
          expiryTime.setMinutes(expiryTime.getMinutes() + (minutes || 0));
          if (now > expiryTime) isExpired = true;
        }

        let newStatus = currentStatus;
        if (isFulfilled) newStatus = 'FULFILLED';
        else if (isExpired) newStatus = 'EXPIRED';
        else if (isPartial) newStatus = 'PARTIAL';
        else newStatus = 'OPEN';

        if (newStatus !== currentStatus) {
          await prisma.foodRequest.update({ where: { id: reqObj.id }, data: { status: newStatus as any } });
          currentStatus = newStatus;
        }
      }
      
      reqObj.status = currentStatus as any;
      processedRequests.push(reqObj);
    }

    processedRequests.sort((a: any, b: any) => {
      const aActive = a.status === 'OPEN' || a.status === 'PARTIAL';
      const bActive = b.status === 'OPEN' || b.status === 'PARTIAL';
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    const formatted = processedRequests.map((reqObj: any) => ({
      id: reqObj.id,
      receiverId: reqObj.receiverId,
      orgName: reqObj.orgName,
      location: reqObj.location,
      urgency: reqObj.urgency,
      createdAt: reqObj.createdAt,
      requiredWithin: reqObj.requiredWithin,
      description: reqObj.description,
      status: reqObj.status,
      pledges: reqObj.pledges, // NEW: Expose to frontend
      items: reqObj.items.map((item: any) => ({
        categoryId: item.categoryId, // NEW: Expose for math
        food: item.category.name.charAt(0).toUpperCase() + item.category.name.slice(1),
        initialQuantity: item.initialQuantity, 
        deficit: item.deficit,
        unit: item.category.unit
      }))
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.foodCategory.findMany({ orderBy: { name: 'asc' } });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receiverId = req.user?.id || (req.user as any)?.userId;
    const { items, urgency, requiredWithin, description } = req.body;

    if (!receiverId) return res.status(401).json({ success: false, message: "Unauthorized." });
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    
    if (!receiver || !['RECEIVER', 'LEAD_DEV'].includes(receiver.role)) {
      return res.status(403).json({ success: false, message: "Access Denied." });
    }
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: "Request items." });

    const newRequest = await prisma.$transaction(async (tx) => {
      const request = await (tx as any).foodRequest.create({
        data: {
          receiverId: receiver.id,
          orgName: receiver.organization || receiver.name,
          location: `${receiver.address}, ${receiver.city}`,
          urgency: String(urgency),
          requiredWithin,
          description,
          items: {
            create: items.map((item: any) => ({
              categoryId: Number(item.categoryId),
              initialQuantity: Number(item.quantity), 
              deficit: Number(item.quantity)
            }))
          }
        },
        include: { items: { include: { category: true } } }
      });
      return request;
    });

    res.status(201).json({ success: true, message: "Request broadcasted successfully.", data: newRequest });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed." });
  }
};