// server/src/routes/receiver.routes.ts
import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';
import { getReceiverStats } from '../controllers/receiver.controller';

const router = Router();

router.get('/stats', verifyToken, roleCheck(['RECEIVER', 'LEAD_DEV']), getReceiverStats);

export default router;