// server/src/utils/validators.ts

import { z } from 'zod';

// ==============================
// AUTHENTICATION & USERS
// ==============================

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const applicationSchema = z.object({
  // Sanitizer already Title Cased this
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  
  // Sanitizer already lowercased this
  email: z.string().email({ message: "Invalid email address" }),
  
  phone: z.string().min(10, { message: "Phone number must be valid" }),
  
  address: z.string().min(5, { message: "Address is too short" }),
  
  // Sanitizer Title Cased this
  organization: z.string().optional(),
  
  motivation: z.string().min(10, { message: "Please provide a valid motivation (min 10 chars)" }),
  
  role: z.enum(['DONOR', 'RECEIVER', 'DELIVERY_MAN'], {
    message: "Invalid role selected", // Changed from 'errorMap' to 'message'
  }),
});

export const staffCreateSchema = z.object({
  applicationId: z.string().uuid(),
  // Coordinator sets the temporary password manually
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// ==============================
// INVENTORY (DONOR)
// ==============================

export const inventorySchema = z.object({
  categoryId: z.number().int().positive(),
  
  description: z.string().min(3, { message: "Description (e.g., 'Fried Rice') is required" }),
  
  quantity: z.number().positive({ message: "Quantity must be greater than 0" }),
  
  // Batch numbers are uppercased by sanitizer (e.g., "B23")
  batchNumber: z.string().min(1, { message: "Batch number is required" }),
  
  expiryDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Expiry date must be in the future",
  }),
});

// ==============================
// REQUESTS (RECEIVER)
// ==============================

export const requestItemSchema = z.object({
  categoryId: z.number().int().positive(),
  quantityNeeded: z.number().positive({ message: "Quantity needed must be positive" }),
});

export const foodRequestSchema = z.object({
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  
  // Users submit an array of items (Composite Request)
  items: z.array(requestItemSchema).min(1, { message: "At least one food item is required" }),
  
  expiresAt: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Deadline must be in the future",
  }),
});

// ==============================
// LOGBOOK (RECEIVER)
// ==============================

export const logbookSchema = z.object({
  lunchEstimated: z.number().int().nonnegative(),
  dinnerEstimated: z.number().int().nonnegative().optional(), // Locked initially
});

// ==============================
// MESSAGING
// ==============================

export const messageSchema = z.object({
  receiverId: z.string().uuid(),
  content: z.string().min(1, { message: "Message cannot be empty" }),
});