// server/src/routes/request.routes.ts
import { Router } from 'express';
import { createPledge, getActiveRequests, getCategories, createRequest } from '../controllers/request.controller';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';


const router = Router();

// Fetch open requests (Donors, Receivers, Coordinators, Delivery)
router.get('/', verifyToken, getActiveRequests);

// ... existing routes ...
router.get('/categories', verifyToken, getCategories);
router.post('/create', verifyToken, roleCheck(['RECEIVER', 'LEAD_DEV']), createRequest);

// Lock a pledge (Only Donors and Lead Devs can commit inventory)
router.post(
  '/:id/pledge', 
  verifyToken, 
  roleCheck(['DONOR', 'LEAD_DEV']), 
  createPledge
);

export default router;