// server/src/routes/message.routes.ts
import { Router } from 'express';
import { sendMessage, getConversationThread, markThreadAsRead, getInbox } from '../controllers/message.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.post('/', verifyToken, sendMessage);
router.put('/mark-read', verifyToken, markThreadAsRead);
// CRITICAL: /inbox must be defined BEFORE /:contactId
router.get('/inbox', verifyToken, getInbox); 
router.get('/:contactId', verifyToken, getConversationThread);

export default router;