// server/src/routes/donor.routes.ts
import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';
import { getDonorStats } from '../controllers/donor.controller';

const router = Router();

router.get('/stats', verifyToken, roleCheck(['DONOR', 'LEAD_DEV']), getDonorStats);

export default router;