// server/src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma'; // FIX 1: Corrected to Default Import
import { HttpException } from '../utils/HttpException';
import { loginSchema } from '../utils/validators';
import { sendEmail } from '../utils/email';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate Input (Zod)
    const { email, password } = loginSchema.parse(req.body);

    // FIX 2: Bulletproof Sanitization
    const sanitizedEmail = email.toLowerCase().trim();

    // 2. Find User
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      // Security Best Practice: Generic error message to prevent email enumeration
      throw new HttpException(401, 'Invalid email or password');
    }

    // 3. Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new HttpException(401, 'Invalid email or password');
    }

    // 4. Generate JWT
    // Payload includes ID and Role for RBAC checks
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' } // Standard 1-day session
    );

    // 5. Return Response (Exclude passwordHash)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          avatar: user.avatar
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new HttpException(400, 'Email is required');
    }

    // 1. Check if user exists
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // 2. Standard Security Practice: If user doesn't exist, silently return success
    if (user) {
      // 3. Generate secure 8-character password
      // Using a defined character set to avoid confusing characters like 'l', '1', 'O', '0'
      const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%&*';
      let newPassword = '';
      for (let i = 0; i < 8; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // 4. Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // 5. Update Database
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });

      // 6. Send the Email
      const message = `Hello ${user.name},\n\nYour password has been reset. Your new temporary system-generated password is:\n\n${newPassword}\n\nPlease log in and change this password immediately.\n\nSecurely,\nFoodSurplus System`;
      
      await sendEmail(user.email, 'Your New Password - FoodSurplus', message);
    }

    // 7. Always return the EXACT same response to prevent email enumeration
    res.status(200).json({
      success: true,
      message: 'If an account exists, a new password has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};