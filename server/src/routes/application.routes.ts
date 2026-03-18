// server/src/routes/application.routes.ts
import { Router } from 'express';
import { createApplication } from '../controllers/application.controller';

import { getAllApplications, updateApplicationStatus } from '../controllers/application.controller';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();
// Note: This is PUBLIC. Do NOT wrap it in verifyToken or roleCheck.
router.post('/', createApplication);
// FIX: Listen to the root path to match the frontend, and fetch ALL data for the tabs
router.get(
  '/', 
  verifyToken, 
  roleCheck(['COORDINATOR', 'LEAD_DEV']), 
  getAllApplications
);

router.patch(
  '/:id/status', 
  verifyToken, 
  roleCheck(['COORDINATOR', 'LEAD_DEV']), 
  updateApplicationStatus
);

export default router;