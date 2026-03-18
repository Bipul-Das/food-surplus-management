// server/src/routes/inventory.routes.ts
import { Router } from 'express';
import { 
  getInventory, 
  createInventoryItem, 
  deleteInventoryItem, 
  updateInventoryItem,
  getPublicInventories 
} from '../controllers/inventory.controller';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

// ==========================================
// PUBLIC/AGGREGATED ROUTES
// (Must come before dynamic /:id routes)
// ==========================================

// Expose the aggregated view to Receivers, Donors, and Devs
router.get('/public', verifyToken, roleCheck(['RECEIVER', 'DONOR', 'LEAD_DEV']), getPublicInventories);

// ==========================================
// PRIVATE/MANAGEMENT ROUTES
// ==========================================

// Route Protection: Only entities handling surplus can access this endpoint
router.get('/', verifyToken, roleCheck(['DONOR', 'COORDINATOR', 'LEAD_DEV']), getInventory);
router.post('/', verifyToken, roleCheck(['DONOR', 'LEAD_DEV']), createInventoryItem);

// Dynamic Parameter Routes
router.patch('/:id', verifyToken, roleCheck(['DONOR', 'LEAD_DEV']), updateInventoryItem);
router.delete('/:id', verifyToken, roleCheck(['DONOR', 'LEAD_DEV']), deleteInventoryItem);

export default router;