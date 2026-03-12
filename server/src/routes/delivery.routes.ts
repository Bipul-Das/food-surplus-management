// server/src/routes/delivery.routes.ts
import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';
import { getMyDeliveries } from '../controllers/delivery.controller';

const router = Router();

// Only Delivery Men (and Lead Devs for testing) can view this
router.get('/my-deliveries', verifyToken, roleCheck(['DELIVERY_MAN', 'LEAD_DEV']), getMyDeliveries);

export default router;