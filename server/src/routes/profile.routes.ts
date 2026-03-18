// server/src/routes/profile.routes.ts
import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { getPublicProfile } from '../controllers/profile.controller';

const router = Router();

// Anyone with a valid network token can view a public profile
router.get('/:id', verifyToken, getPublicProfile);

export default router;