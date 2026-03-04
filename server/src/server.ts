// server/src/server.ts

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { globalSanitizer } from './middleware/sanitizer';
import { errorMiddleware } from './middleware/error.middleware'; 
import authRoutes from './routes/auth.routes'; // Import Routes

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// 1. Security & Body Parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Global Sanitization (Before Routes)
app.use(globalSanitizer);

// 3. Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Food Surplus Management API is running securely.',
    timestamp: new Date().toISOString()
  });
});

// ✅ Register Auth Routes
// This activates POST /api/auth/login
app.use('/api/auth', authRoutes);

// 4. Global Error Handling (MUST be last)
app.use(errorMiddleware);

// Initialize Server
app.listen(PORT, () => {
  console.log(`[SERVER] Running in development mode on http://localhost:${PORT}`);
});