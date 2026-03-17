// server/src/server.ts

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { globalSanitizer } from './middleware/sanitizer';
import { errorMiddleware } from './middleware/error.middleware'; 
import authRoutes from './routes/auth.routes'; // Import Routes
import applicationRoutes from './routes/application.routes';
import userRoutes from './routes/user.routes';
import messageRoutes from './routes/message.routes';
// server/src/server.ts (or app.ts)
import inventoryRoutes from './routes/inventory.routes'; // <-- 1. Import it
import requestRoutes from './routes/request.routes';
import deliveryRoutes from './routes/delivery.routes'; // Add this import at the top
import donorRoutes from './routes/donor.routes'; // Add to your imports
import receiverRoutes from './routes/receiver.routes'; // Add this to your imports
import logbookRoutes from './routes/logbook.routes';




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
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/inventory', inventoryRoutes); // <-- 2. Register it EXACTLY like this
app.use('/api/requests', requestRoutes);

app.use('/api/deliveries', deliveryRoutes);
// Scroll down to your route mappings and add:
app.use('/api/donors', donorRoutes);
app.use('/api/receivers', receiverRoutes);
app.use('/api/logbooks', logbookRoutes);
// 4. Global Error Handling (MUST be last)
app.use(errorMiddleware);

// Initialize Server
app.listen(PORT, () => {
  console.log(`[SERVER] Running in development mode on http://localhost:${PORT}`);
});