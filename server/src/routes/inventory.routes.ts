// server/src/routes/inventory.routes.ts
import { Router } from 'express';
import { getInventory, createInventoryItem, deleteInventoryItem, updateInventoryItem } from '../controllers/inventory.controller';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

// Route Protection: Only entities handling surplus can access this endpoint
router.get('/', verifyToken, roleCheck(['DONOR', 'COORDINATOR', 'LEAD_DEV']), getInventory);
router.post('/', verifyToken, roleCheck(['DONOR', 'LEAD_DEV']), createInventoryItem);
router.delete('/:id', verifyToken, roleCheck(['DONOR', 'LEAD_DEV']), deleteInventoryItem);
router.patch('/:id', verifyToken, roleCheck(['DONOR', 'LEAD_DEV']), updateInventoryItem);
export default router;