// server/src/controllers/message.controller.ts
import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from './user.controller';

// ----------------------------------------------------------------------
// HELPER: JWT Extractor
// ----------------------------------------------------------------------
const extractUserId = (req: AuthRequest) => {
  return req.user?.id || (req.user as any)?.userId || (req.user as any)?._id || (req.user as any)?.user?.id;
};

// ----------------------------------------------------------------------
// HELPER: God-Tier ID Resolver
// ----------------------------------------------------------------------
// Fixes Uppercase UUID anomalies and deep-scans relations to find the true User
async function resolveTrueUserId(candidateId: string): Promise<string | null> {
  if (!candidateId) return null;
  const cleanId = candidateId.trim();

  try {
    // 1. Direct Hit (Exact Match)
    let user = await prisma.user.findUnique({ where: { id: cleanId } });
    if (user) return user.id;

    // 2. Lowercase Hit (Fixes PostgreSQL/MongoDB Uppercase UUID strictness)
    user = await prisma.user.findUnique({ where: { id: cleanId.toLowerCase() } }).catch(() => null);
    if (user) return user.id;

    // 3. Relational Deep Scan (If frontend passed a Profile/DeliveryMan ID instead of User ID)
    const relationalTables = ['deliveryMan', 'receiver', 'donor', 'coordinator', 'profile', 'staff', 'application'];
    
    for (const tableName of relationalTables) {
      const table = (prisma as any)[tableName];
      if (table) {
        const record = await table.findUnique({ where: { id: cleanId } }).catch(() => null) ||
                       await table.findUnique({ where: { id: cleanId.toLowerCase() } }).catch(() => null);
                       
        if (record && record.userId) {
          const linkedUser = await prisma.user.findUnique({ where: { id: record.userId } });
          if (linkedUser) return linkedUser.id;
        }
      }
    }
  } catch (error) {
    // Silently catch schema mismatch errors during the deep scan
  }

  return null; // The record is officially a ghost.
}

// ----------------------------------------------------------------------
// CONTROLLERS
// ----------------------------------------------------------------------

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { receiverId, content } = req.body;
    
    const senderId = extractUserId(req);
    if (!senderId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Missing Token Data." });
    }

    const trueSenderId = await resolveTrueUserId(senderId);
    const trueReceiverId = await resolveTrueUserId(receiverId);

    if (!trueSenderId) {
      return res.status(401).json({ success: false, message: "Session Ghost: Your identity is missing from DB. Please Log Out and Log Back In." });
    }

    if (!trueReceiverId) {
      return res.status(400).json({ success: false, message: `System Error: The ID [${receiverId}] does not map to a valid User in the core database.` });
    }

    const newMessage = await prisma.message.create({
      data: { senderId: trueSenderId, receiverId: trueReceiverId, content, isRead: false },
      select: {
        id: true, content: true, senderId: true, receiverId: true, isRead: true, createdAt: true,
        sender: { select: { name: true, role: true } }
      }
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    next(error);
  }
};

export const getInbox = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUserId = extractUserId(req);
    const trueUserId = await resolveTrueUserId(currentUserId || "");
    if (!trueUserId) return res.status(401).json({ success: false, message: "Unauthorized." });

    // LEAD DEV FIX: Fetch the 'avatar' field for both the sender and receiver.
    const allMessages = await prisma.message.findMany({
      where: { OR: [{ senderId: trueUserId }, { receiverId: trueUserId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true } }, 
        receiver: { select: { id: true, name: true, role: true, avatar: true } }
      }
    });

    const contactsMap = new Map();

    for (const msg of allMessages) {
      const isSender = msg.senderId === trueUserId;
      const contact = isSender ? msg.receiver : msg.sender;

      // Ensure we only process valid contacts (failsafe if a user was deleted but messages remain)
      if (!contact) continue;

      if (!contactsMap.has(contact.id)) {
        let contactName = contact.name;
        if (contact.role === 'COORDINATOR' && req.user!.role !== 'LEAD_DEV') {
          contactName = 'Network Coordinator';
        }

        contactsMap.set(contact.id, {
          id: contact.id, 
          name: contactName, 
          role: contact.role,
          lastMessage: msg.content, 
          time: msg.createdAt, 
          unread: 0,
          avatar: contact.avatar // LEAD DEV FIX: Pass the avatar into the Map
        });
      }

      if (!isSender && !msg.isRead) {
        contactsMap.get(contact.id).unread += 1;
      }
    }

    // Convert Map values back to array and send to frontend
    res.status(200).json({ success: true, data: Array.from(contactsMap.values()) });
  } catch (error) {
    next(error);
  }
};

export const getConversationThread = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUserId = extractUserId(req);
    const trueUserId = await resolveTrueUserId(currentUserId || "");
    if (!trueUserId) return res.status(401).json({ success: false, message: "Unauthorized." });
    
    const rawContactId = req.params.contactId as string;
    const trueContactId = await resolveTrueUserId(rawContactId);

    if (!trueContactId) {
       return res.status(200).json({ success: true, data: [] });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: trueUserId, receiverId: trueContactId },
          { senderId: trueContactId, receiverId: trueUserId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, content: true, senderId: true, receiverId: true, isRead: true, createdAt: true,
        // Optional: If you want avatars inside the chat bubbles later, you can add avatar: true here too
        sender: { select: { id: true, name: true, role: true } } 
      }
    });

    const maskedMessages = messages.map(msg => ({
      ...msg,
      sender: {
        ...msg.sender,
        name: (msg.sender.role === 'COORDINATOR' && req.user!.role !== 'LEAD_DEV') ? 'Network Coordinator' : msg.sender.name
      }
    }));

    res.status(200).json({ success: true, data: maskedMessages });
  } catch (error) {
    next(error);
  }
};

export const markThreadAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUserId = extractUserId(req);
    const trueUserId = await resolveTrueUserId(currentUserId || "");
    if (!trueUserId) return res.status(401).json({ success: false, message: "Unauthorized." });
    
    const { contactId } = req.body;
    const trueContactId = await resolveTrueUserId(contactId);

    if (!trueContactId) return res.status(200).json({ success: true, updatedCount: 0 });

    const updated = await prisma.message.updateMany({
      where: { senderId: trueContactId, receiverId: trueUserId, isRead: false },
      data: { isRead: true }
    });

    res.status(200).json({ success: true, updatedCount: updated.count });
  } catch (error) {
    next(error);
  }
};