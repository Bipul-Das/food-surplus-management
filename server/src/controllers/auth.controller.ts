// server/src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { HttpException } from '../utils/HttpException';
import { loginSchema } from '../utils/validators';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate Input (Zod)
    const { email, password } = loginSchema.parse(req.body);

    // 2. Find User
    const user = await prisma.user.findUnique({
      where: { email },
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