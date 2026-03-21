// server/src/controllers/public.controller.ts

import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

// ==========================================
// TELEMETRY BASELINES
// The foundational metrics before system launch
// ==========================================
const BASE_METRICS = {
  peopleServed: 120000,
  foodDonatedKg: 45000,
  safeDeliveries: 8500,
  activePartners: 340,
};

/**
 * Mathematical Conversion Engine
 * Converts various units into a standardized "Kg equivalent"
 * Logic: 1 Liter = 1 Kg | 1 Can = 1 Kg | 100 Loaves = 1 Kg
 */
const calculateStandardizedKg = (unit: string, quantity: number): number => {
  const normalizedUnit = unit.toLowerCase();
  
  if (normalizedUnit.includes('loaves') || normalizedUnit.includes('loaf')) {
    return quantity / 100;
  }
  
  // For kg, liters, cans, we treat as 1:1 ratio based on project requirements
  return quantity;
};

export const getPublicSystemStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ---------------------------------------------------------
    // 1. ACTIVE PARTNERS CALCULATION
    // Total number of approved DONOR, RECEIVER, and DELIVERY_MAN
    // ---------------------------------------------------------
    const newPartnersCount = await prisma.user.count({
      where: {
        role: { in: ['DONOR', 'RECEIVER', 'DELIVERY_MAN'] },
        isActive: true, 
      },
    });

    // ---------------------------------------------------------
    // 2. SAFE DELIVERIES CALCULATION
    // Total number of Pledges marked as COMPLETED (Successfully delivered)
    // ---------------------------------------------------------
    const newDeliveriesCount = await prisma.pledge.count({
      where: {
        status: 'COMPLETED', 
      },
    });

    // ---------------------------------------------------------
    // 3. PEOPLE SERVED CALCULATION
    // Sum of lunchEstimated + dinnerEstimated across all logbooks
    // ---------------------------------------------------------
    const logbookAggregations = await prisma.logbook.aggregate({
      _sum: {
        lunchEstimated: true,
        dinnerEstimated: true,
      },
    });

    const newPeopleServed = 
      (logbookAggregations._sum.lunchEstimated || 0) + 
      (logbookAggregations._sum.dinnerEstimated || 0);

    // ---------------------------------------------------------
    // 4. TOTAL FOOD DONATED CALCULATION
    // We analyze all items attached to COMPLETED pledges
    // ---------------------------------------------------------
    const deliveredItems = await prisma.pledgeItem.findMany({
      where: {
        pledge: {
          status: 'COMPLETED' 
        }
      },
      include: {
        category: true // Needed to access the 'unit' string for conversion
      }
    });

    let newFoodDonatedKg = 0;

    for (const item of deliveredItems) {
        if (item.category && item.category.unit && item.quantity) {
            newFoodDonatedKg += calculateStandardizedKg(item.category.unit, item.quantity);
        }
    }

    // ---------------------------------------------------------
    // 5. COMBINE BASELINES WITH LIVE DATA
    // ---------------------------------------------------------
    const liveStats = {
      peopleServed: BASE_METRICS.peopleServed + newPeopleServed,
      foodDonatedKg: Math.round((BASE_METRICS.foodDonatedKg + newFoodDonatedKg) * 10) / 10, 
      safeDeliveries: BASE_METRICS.safeDeliveries + newDeliveriesCount,
      activePartners: BASE_METRICS.activePartners + newPartnersCount,
    };

    res.status(200).json({ 
        success: true, 
        message: "Live telemetry retrieved successfully.",
        data: liveStats 
    });

  } catch (error) {
    next(error);
  }
};