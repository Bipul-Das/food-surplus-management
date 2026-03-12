// server/src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// =====================================
// STAFF MANAGEMENT (Admin Only)
// =====================================

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role, name, organization, phone, address, city } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role,
        name,
        organization,
        phone,
        address,
        city
      },
      select: {
        id: true, email: true, role: true, name: true,
        organization: true, phone: true, address: true,
        city: true, createdAt: true,
      } 
    });

    res.status(201).json({ success: true, message: "User account provisioned successfully.", data: newUser });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, role: true, name: true,
        organization: true, phone: true, address: true, 
        city: true, createdAt: true,
      }
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id as string;
    // Smart ID Parser: Converts to Number if the DB uses Integers, otherwise keeps as String UUID
    const id = isNaN(Number(rawId)) ? rawId : Number(rawId);
    
    const { email, password, role, name, organization, phone, address, city } = req.body;
    
    if (!req.user?.role) return res.status(401).json({ success: false, message: "Unauthorized access." });
    const currentUserRole = req.user.role;

    // Use "as any" to satisfy TS strictness across different DB schema types
    const targetUser = await prisma.user.findUnique({ where: { id: id as any } });
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found." });

    if (currentUserRole === 'COORDINATOR' && targetUser.role === 'LEAD_DEV') {
      return res.status(403).json({ success: false, message: "Unauthorized to modify Lead Developer accounts." });
    }

    let dataToUpdate: any = { role, name, organization, phone, address, city };
    if (email) dataToUpdate.email = email.toLowerCase();

    if (password) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: id as any },
      data: dataToUpdate,
      select: { id: true, email: true, role: true, name: true, organization: true, phone: true, address: true, city: true }
    });

    res.status(200).json({ success: true, message: "Entity updated securely.", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id as string;
    const id = isNaN(Number(rawId)) ? rawId : Number(rawId);
    
    if (!req.user?.id || !req.user?.role) return res.status(401).json({ success: false, message: "Unauthorized access." });
    
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    if (rawId === currentUserId || id === currentUserId) {
      return res.status(400).json({ success: false, message: "Cannot delete your own active session." });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: id as any } });
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found." });

    if (currentUserRole === 'COORDINATOR' && targetUser.role === 'LEAD_DEV') {
      return res.status(403).json({ success: false, message: "Unauthorized to delete Lead Developer accounts." });
    }

    await prisma.user.delete({ where: { id: id as any } });
    res.status(200).json({ success: true, message: "Entity successfully purged from network." });
  } catch (error) {
    next(error);
  }
};

// =====================================
// AUTHENTICATED PROFILE (All Users)
// =====================================

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized access. User context missing." });

    const rawId = req.user.id;
    const id = isNaN(Number(rawId)) ? rawId : Number(rawId);

    const user = await prisma.user.findUnique({
      where: { id: id as any },
      select: {
        id: true, email: true, role: true, name: true, 
        organization: true, phone: true, address: true, 
        city: true, website: true, avatar: true
      }
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized access. User context missing." });

    const rawId = req.user.id;
    const id = isNaN(Number(rawId)) ? rawId : Number(rawId);

    const { name, phone, address, city, website, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: id as any },
      data: { name, phone, address, city, website, avatar },
      select: {
        id: true, email: true, role: true, name: true, 
        organization: true, phone: true, address: true, 
        city: true, website: true, avatar: true
      }
    });

    res.status(200).json({ success: true, message: "Profile synchronized successfully.", data: updatedUser });
  } catch (error) {
    next(error);
  }
};