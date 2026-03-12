// server/src/controllers/message.controller.ts
import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { receiverId, content } = req.body;
    
    // Safety check to satisfy TS compiler
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const senderId = req.user.id;

    const newMessage = await prisma.message.create({
      data: { senderId, receiverId, content, isRead: false },
      // Use select instead of include for strict type definition
      select: {
        id: true,
        content: true,
        senderId: true,
        receiverId: true,
        isRead: true,
        createdAt: true,
        sender: { select: { name: true, role: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: "Message transmitted successfully.",
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationThread = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const currentUserId = req.user.id;
    
    // FIX 1: Explicitly cast the URL parameter to a string
    const contactId = req.params.contactId as string;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: contactId },
          { senderId: contactId, receiverId: currentUserId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      // FIX 2: Use a strict select payload so TS recognizes the 'sender' relation
      select: {
        id: true,
        content: true,
        senderId: true,
        receiverId: true,
        isRead: true,
        createdAt: true,
        sender: { select: { id: true, name: true, role: true } }
      }
    });

    // THE ANONYMITY MASK: Sanitize the output payload
    const maskedMessages = messages.map(msg => ({
      ...msg,
      sender: {
        ...msg.sender,
        // Override the name if the sender is a Coordinator, unless I am the Lead Dev auditing the logs
        name: (msg.sender.role === 'COORDINATOR' && req.user!.role !== 'LEAD_DEV') 
              ? 'Network Coordinator' 
              : msg.sender.name
      }
    }));

    res.status(200).json({ success: true, data: maskedMessages });
  } catch (error) {
    next(error);
  }
};

export const markThreadAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const currentUserId = req.user.id;
    const { contactId } = req.body;

    // Update all unread messages sent BY the contact TO the current user
    const updated = await prisma.message.updateMany({
      where: {
        senderId: contactId,
        receiverId: currentUserId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.status(200).json({ 
      success: true, 
      message: "Thread synchronized.", 
      updatedCount: updated.count 
    });
  } catch (error) {
    next(error);
  }
};