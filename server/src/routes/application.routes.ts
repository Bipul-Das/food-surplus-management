// server/src/routes/application.routes.ts
import { Router } from 'express';
import { getPendingApplications, updateApplicationStatus } from '../controllers/application.controller';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

// God Mode (LEAD_DEV) and COORDINATOR share access to the review queue
router.get(
  '/pending', 
  verifyToken, 
  roleCheck(['COORDINATOR', 'LEAD_DEV']), 
  getPendingApplications
);

router.patch(
  '/:id/status', 
  verifyToken, 
  roleCheck(['COORDINATOR', 'LEAD_DEV']), 
  updateApplicationStatus
);

export default router;