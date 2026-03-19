// server/src/controllers/edit-profile.controller.ts
import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || (req.user as any)?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        organization: true,
        phone: true,
        address: true,
        city: true,
        website: true,
        avatar: true,
        isActive: true // NEW: Expose the toggle state to the frontend
      }
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfileInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || (req.user as any)?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { name, organization, phone, address, city, website, isActive } = req.body;
    let avatarUrl = req.body.avatar;

    if (req.file) {
      avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    // Safely parse the isActive toggle from FormData strings or native booleans
    let parsedIsActive = undefined;
    if (isActive !== undefined) {
      parsedIsActive = isActive === 'true' || isActive === true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        organization: organization || null,
        phone,
        address,
        city,
        website: website || null,
        avatar: avatarUrl || null,
        ...(parsedIsActive !== undefined && { isActive: parsedIsActive }) // Only update if explicitly provided
      },
      select: { name: true, organization: true, phone: true, address: true, city: true, website: true, avatar: true, isActive: true }
    });

    res.status(200).json({ success: true, message: "Profile updated successfully.", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || (req.user as any)?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both old and new passwords are required." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password." });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
};