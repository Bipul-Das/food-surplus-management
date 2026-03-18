// server/src/controllers/edit-profile.controller.ts
import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

// 1. Fetch current user data to pre-fill the form
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
        avatar: true
      }
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// 2. Update basic profile information
export const updateProfileInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || (req.user as any)?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // When using Multer, text fields come through req.body
    const { name, organization, phone, address, city, website } = req.body;
    let avatarUrl = req.body.avatar; // Might hold the old avatar

    // If Multer caught a new file, construct the local URL for it
    if (req.file) {
      // Points to the static folder we exposed in server.ts
      avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
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
        avatar: avatarUrl || null
      },
      select: { name: true, organization: true, phone: true, address: true, city: true, website: true, avatar: true }
    });

    res.status(200).json({ success: true, message: "Profile updated successfully.", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// 3. Securely change the password
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || (req.user as any)?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both old and new passwords are required." });
    }

    // Retrieve the user's current hash
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Verify the old password matches the database
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password." });
    }

    // Hash the new password and save it
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