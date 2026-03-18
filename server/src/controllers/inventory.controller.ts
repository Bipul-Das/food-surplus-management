// server/src/controllers/inventory.controller.ts
import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const getInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user!.role;
    
    // FIX: Safely extract ID regardless of JWT payload structure
    const userId = req.user?.id || (req.user as any)?.userId;

    // Security Guard
    if (!userId) {
      return res.status(401).json({ success: false, message: "Invalid token payload. Could not verify identity." });
    }

    // Strict Access Control: Donors only see their own items. Coordinators/Devs see all.
    let whereClause = {};
    if (userRole === 'DONOR') {
      whereClause = { donorId: userId };
    }

    const inventory = await prisma.surplusInventory.findMany({
      where: whereClause,
      include: { 
        category: true, 
        donor: { select: { name: true, organization: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { categoryName, unit, description, currentQuantity, batchNumber, expiryDate } = req.body;
    
    // FIX: Safely extract ID regardless of JWT payload structure
    const donorId = req.user?.id || (req.user as any)?.userId;

    // Security Guard: Prevent Prisma from crashing if token is malformed
    if (!donorId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID missing from token payload." });
    }

    // 1. Handle Relational Category Logic
    let category = await prisma.foodCategory.findUnique({ where: { name: categoryName.toLowerCase() } });
    if (!category) {
      category = await prisma.foodCategory.create({
        data: { name: categoryName.toLowerCase(), unit: unit || 'kg' }
      });
    }

    // 2. Create the Inventory Record
    const newItem = await prisma.surplusInventory.create({
      data: {
        donorId: donorId, // Now guaranteed to be a valid string
        categoryId: category.id,
        description,
        currentQuantity: parseFloat(currentQuantity),
        batchNumber,
        expiryDate: new Date(expiryDate),
      },
      include: { category: true }
    });

    res.status(201).json({ success: true, message: "Inventory logged securely.", data: newItem });
  } catch (error) {
    next(error);
  }
};

export const deleteInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    
    // FIX: Safely extract ID regardless of JWT payload structure
    const userId = req.user?.id || (req.user as any)?.userId;

    // Security Guard
    if (!userId) {
      return res.status(401).json({ success: false, message: "Invalid token payload. Could not verify identity." });
    }

    // Verify ownership before deletion to prevent unauthorized tampering
    const item = await prisma.surplusInventory.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ success: false, message: "Item not found." });
    
    if (item.donorId !== userId && req.user!.role !== 'LEAD_DEV') {
      return res.status(403).json({ success: false, message: "Unauthorized deletion attempt." });
    }

    await prisma.surplusInventory.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Item purged from active inventory." });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { categoryName, unit, currentQuantity, expiryDate } = req.body;
    
    const userId = req.user?.id || (req.user as any)?.userId;

    // Security Guard
    if (!userId) {
      return res.status(401).json({ success: false, message: "Invalid token payload." });
    }

    // Verify ownership
    const item = await prisma.surplusInventory.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ success: false, message: "Item not found." });
    
    if (item.donorId !== userId && req.user!.role !== 'LEAD_DEV') {
      return res.status(403).json({ success: false, message: "Unauthorized update attempt." });
    }

    // Handle Category Logic (in case they changed the food type)
    let category = await prisma.foodCategory.findUnique({ where: { name: categoryName.toLowerCase() } });
    if (!category) {
      category = await prisma.foodCategory.create({
        data: { name: categoryName.toLowerCase(), unit: unit || 'kg' }
      });
    }

    // Update the Record
    const updatedItem = await prisma.surplusInventory.update({
      where: { id },
      data: {
        categoryId: category.id,
        currentQuantity: parseFloat(currentQuantity),
        expiryDate: new Date(expiryDate),
      },
      include: { category: true }
    });

    res.status(200).json({ success: true, message: "Inventory updated securely.", data: updatedItem });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// NEW: PUBLIC INVENTORY AGGREGATION ENGINE
// ==========================================
export const getPublicInventories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Fetch all active surplus items, including donor and category info
    const activeInventories = await prisma.surplusInventory.findMany({
      where: { currentQuantity: { gt: 0 } },
      include: {
        donor: true,
        category: true
      }
    });

    // Group the raw data by Donor to hide specific batches and quantities
    const donorMap = new Map<string, any>();

    for (const inv of activeInventories) {
      if (!donorMap.has(inv.donorId)) {
        donorMap.set(inv.donorId, {
          donorId: inv.donor.id,
          name: inv.donor.organization || inv.donor.name,
          address: inv.donor.address,
          city: inv.donor.city,
          avatar: inv.donor.avatar,
          categories: new Set<string>() // Use a Set to prevent duplicate tags
        });
      }
      // Add the food category name to the donor's Set
      donorMap.get(inv.donorId).categories.add(inv.category.name);
    }

    // Convert the Map and Sets back into clean JSON arrays for the frontend
    const formatted = Array.from(donorMap.values()).map(d => ({
      ...d,
      categories: Array.from(d.categories)
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};