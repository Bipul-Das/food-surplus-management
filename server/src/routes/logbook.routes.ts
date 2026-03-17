// server/src/routes/logbook.routes.ts
import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { roleCheck } from '../middleware/roleCheck';
import { getLogbooks, updateTodayLogbook, handleLogbookAction } from '../controllers/logbook.controller';

const router = Router();

router.get('/', verifyToken, roleCheck(['RECEIVER', 'LEAD_DEV']), getLogbooks);
router.put('/today/:id', verifyToken, roleCheck(['RECEIVER', 'LEAD_DEV']), updateTodayLogbook);
// CHANGED THIS ROUTE
router.patch('/today/:id/action', verifyToken, roleCheck(['RECEIVER', 'LEAD_DEV']), handleLogbookAction);

export default router;