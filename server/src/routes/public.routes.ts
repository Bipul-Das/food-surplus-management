// server/src/routes/public.routes.ts

import { Router } from 'express';
import { getPublicSystemStats } from '../controllers/public.controller';

const router = Router();

// =====================================
// UNRESTRICTED PUBLIC ENDPOINTS
// No JWT or session required. Safe for landing pages.
// =====================================

// GET /api/public/stats - Retrieve live system telemetry
router.get('/stats', getPublicSystemStats);

export default router;