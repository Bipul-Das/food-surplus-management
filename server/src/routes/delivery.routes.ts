// server/src/routes/delivery.routes.ts
import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';
import { getMyDeliveries, getDeliveryHistory } from '../controllers/delivery.controller'; // Add getDeliveryHistory here

const router = Router();

router.get('/my-deliveries', verifyToken, roleCheck(['DELIVERY_MAN', 'LEAD_DEV']), getMyDeliveries);
// NEW ROUTE FOR HISTORY PAGE
router.get('/history', verifyToken, roleCheck(['DELIVERY_MAN', 'LEAD_DEV']), getDeliveryHistory);

export default router;