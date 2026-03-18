// server/src/routes/admin.routes.ts
import { Router } from 'express';
import { getSystemStats } from '../controllers/admin.controller';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

// Secure route: Only LEAD_DEV can pull system-wide telemetry
router.get(
  '/stats', 
  verifyToken, 
  roleCheck(['LEAD_DEV', 'COORDINATOR']), 
  getSystemStats
);

export default router;