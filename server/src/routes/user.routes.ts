// server/src/routes/user.routes.ts
import { Router } from 'express';
import { 
  createUser, 
  getAllUsers, 
  getMe, 
  updateMe, 
  updateUserById, 
  deleteUserById 
} from '../controllers/user.controller';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';
import { globalSanitizer } from '../middleware/sanitizer';

const router = Router();

// =====================================
// 1. AUTHENTICATED PROFILE (All Users)
// MUST go first to prevent /:id wildcard collisions
// =====================================

router.get('/me', verifyToken, getMe);

// Sanitizer is kept here for public profile text fields
router.patch('/me', verifyToken, globalSanitizer, updateMe);


// =====================================
// 2. STAFF MANAGEMENT (Admin Only)
// =====================================

router.post('/create', verifyToken, roleCheck(['COORDINATOR', 'LEAD_DEV']), createUser);
router.get('/', verifyToken, roleCheck(['LEAD_DEV', 'COORDINATOR', 'DONOR', 'RECEIVER', 'DELIVERY_MAN']), getAllUsers);

// Dynamic parameter routes (/:id) MUST go at the very bottom
router.patch('/:id', verifyToken, roleCheck(['COORDINATOR', 'LEAD_DEV']), updateUserById);
router.delete('/:id', verifyToken, roleCheck(['COORDINATOR', 'LEAD_DEV']), deleteUserById);

export default router;