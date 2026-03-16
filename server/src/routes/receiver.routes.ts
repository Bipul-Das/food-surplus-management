// server/src/routes/receiver.routes.ts

import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';
import { getReceiverStats, getMyRequests, updatePledgeStatus } from '../controllers/receiver.controller';

const router = Router();

router.get('/stats', verifyToken, roleCheck(['RECEIVER', 'LEAD_DEV']), getReceiverStats);
// NEW ROUTES
router.get('/my-requests', verifyToken, roleCheck(['RECEIVER', 'LEAD_DEV']), getMyRequests);
router.patch('/pledge/:pledgeId/status', verifyToken, roleCheck(['RECEIVER', 'LEAD_DEV']), updatePledgeStatus);

export default router;