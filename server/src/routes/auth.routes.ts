// server/src/routes/auth.routes.ts
import { Router } from 'express';
import { login, forgotPassword } from '../controllers/auth.controller'; // Import the new controller

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword); // Register endpoint

export default router;