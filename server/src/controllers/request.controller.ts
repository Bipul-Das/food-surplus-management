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

    // Force lowercase to resolve UUID text-casing mismatches
    const cleanDriverId = String(driverId).trim().toLowerCase();

    const driver = await (prisma as any).user.findFirst({ 
      where: { id: cleanDriverId } 
    });
    
    if (!driver) {
      return res.status(400).json({ 
        success: false, 
        message: `Telemetry Error: Database rejected ID '${cleanDriverId}'. User does not exist.` 
      });
    }

    if (driver.role !== 'DELIVERY_MAN') {
      return res.status(400).json({ 
        success: false, 
        message: `Telemetry Error: User '${driver.name}' is a ${driver.role}, not a DELIVERY_MAN.` 
      });
    }

    const existingPledge = await (prisma as any).pledge.findFirst({
      where: { requestId, donorId }
    });
    
    if (existingPledge) {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction Denied: You have already committed a pledge to this specific request." 
      });
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
        if (pledgeQty > requestItem.deficit) throw new Error(`Transaction Denied: Cannot pledge more ${foodName} than the required deficit.`);

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

        await (tx as any).requestItem.update({
          where: { id: requestItem.id },
          data: { deficit: requestItem.deficit - pledgeQty }
        });

        pledgeItemsData.push({ categoryId: category.id, quantity: pledgeQty });
      }

      if (pledgeItemsData.length === 0) {
        throw new Error("Transaction Denied: No valid quantities provided.");
      }

      const newPledge = await (tx as any).pledge.create({
        data: {
          requestId,
          donorId,
          driverId: cleanDriverId,
          status: "LOCKED",
          items: {
            create: pledgeItemsData
          }
        }
      });

      return newPledge;
    });

    res.status(201).json({
      success: true,
      message: "Pledge successfully locked to Logistics.",
      data: transactionResult
    });

  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Allocation failed." });
  }
};

export const getActiveRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requests = await prisma.foodRequest.findMany({
      where: { status: { in: ['OPEN', 'PARTIAL'] as any } },
      include: {
        items: { include: { category: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    const formatted = requests.map((reqObj: any) => ({
      id: reqObj.id,
      receiverId: reqObj.receiverId,
      orgName: reqObj.orgName,
      location: reqObj.location,
      urgency: reqObj.urgency,
      createdAt: reqObj.createdAt,
      requiredWithin: reqObj.requiredWithin,
      description: reqObj.description,
      items: reqObj.items.map((item: any) => ({
        food: item.category.name.charAt(0).toUpperCase() + item.category.name.slice(1),
        initialQuantity: item.initialQuantity, // FIXED: Maps the permanent demand
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
    const categories = await prisma.foodCategory.findMany({
      orderBy: { name: 'asc' }
    });
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
      return res.status(403).json({ success: false, message: "Access Denied: Insufficient privileges to create deficits." });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "You must request at least one item." });
    }

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
              initialQuantity: Number(item.quantity), // FIXED: Saves the permanent demand
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
    res.status(400).json({ success: false, message: error.message || "Failed to create request." });
  }
};