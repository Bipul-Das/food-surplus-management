// server/src/routes/message.routes.ts
import { Router } from 'express';
import { sendMessage, getConversationThread, markThreadAsRead } from '../controllers/message.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

// All roles need messaging, so we only require a valid token, not a specific role check
router.post('/', verifyToken, sendMessage);
router.get('/:contactId', verifyToken, getConversationThread);
router.put('/mark-read', verifyToken, markThreadAsRead);

export default router;