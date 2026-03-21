// server/src/server.ts

import express, { Application, Request, Response } from 'express';
import path from 'path'; 

import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { globalSanitizer } from './middleware/sanitizer';
import { errorMiddleware } from './middleware/error.middleware'; 
import authRoutes from './routes/auth.routes'; // Import Routes
import applicationRoutes from './routes/application.routes';
import userRoutes from './routes/user.routes';
import messageRoutes from './routes/message.routes';
import inventoryRoutes from './routes/inventory.routes'; // <-- 1. Import it
import requestRoutes from './routes/request.routes';
import deliveryRoutes from './routes/delivery.routes'; // Add this import at the top
import donorRoutes from './routes/donor.routes'; // Add to your imports
import receiverRoutes from './routes/receiver.routes'; // Add this to your imports
import logbookRoutes from './routes/logbook.routes';
import profileRoutes from './routes/profile.routes';
import editProfileRoutes from './routes/edit-profile.routes';
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';

// ... your existing middleware ...




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
// Replace your existing static image line in server/src/server.ts with this:
const uploadsPath = path.resolve(__dirname, '../uploads');
console.log(`[Server] Serving static images from: ${uploadsPath}`);

// FIX: Intercept the request and stamp it with the Cross-Origin VIP pass
app.use('/uploads', (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsPath));

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/receivers', receiverRoutes);
app.use('/api/logbooks', logbookRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/edit-profile', editProfileRoutes);
app.use('/api/public', publicRoutes);
app.use(errorMiddleware);

// Initialize Server
app.listen(PORT, () => {
  console.log(`[SERVER] Running in development mode on http://localhost:${PORT}`);
});