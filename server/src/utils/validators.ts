// server/src/utils/validators.ts

import { z } from 'zod';

// ==============================
// GLOBAL DATA STANDARDS
// ==============================
// We define these base rules here so they can be reused across any future schemas
// ensuring consistent data integrity across the entire application.

const standardName = z.string().min(3, { message: "Name must be at least 3 characters." });
const standardCity = z.string().min(3, { message: "City must be at least 3 characters." });
const standardAddress = z.string().min(6, { message: "Address must be at least 6 characters." });

// LEAD DEV FIX: Mathematical synchronization with the frontend mask (10 + 5 digits)
const standardPhone = z.string().regex(/^10\d{5}$/, { message: "Phone number must be exactly 7 digits starting with 10." });


// ==============================
// AUTHENTICATION & USERS
// ==============================

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), 
});

export const applicationSchema = z.object({
  // Applied Global Standards
  name: standardName,
  city: standardCity,
  address: standardAddress,
  phone: standardPhone,
  
  // Sanitizer already lowercased this
  email: z.string().email({ message: "Invalid official email address." }),
  
  // Sanitizer Title Cased this
  organization: z.string().optional(),
  
  motivation: z.string().min(20, { message: "Please provide a detailed motivation (minimum 20 characters)." }),
  
  role: z.enum(['DONOR', 'RECEIVER', 'DELIVERY_MAN'], {
    message: "Invalid operational role selected.", 
  }),
});

export const staffCreateSchema = z.object({
  applicationId: z.string().uuid(),
  // Coordinator sets the temporary password manually
  password: z.string().min(6, { message: "Security protocol requires a password of at least 6 characters." }),
});


// ==============================
// INVENTORY (DONOR)
// ==============================

export const inventorySchema = z.object({
  categoryId: z.number().int().positive(),
  
  description: z.string().min(3, { message: "Description (e.g., 'Fried Rice') is required." }),
  
  quantity: z.number().positive({ message: "Quantity must be greater than 0." }),
  
  // Batch numbers are uppercased by sanitizer (e.g., "B23")
  batchNumber: z.string().min(1, { message: "Batch reference is required." }),
  
  expiryDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Expiry deadline must be in the future.",
  }),
});


// ==============================
// REQUESTS (RECEIVER)
// ==============================

export const requestItemSchema = z.object({
  categoryId: z.number().int().positive(),
  quantityNeeded: z.number().positive({ message: "Quantity requested must be a positive integer." }),
});

export const foodRequestSchema = z.object({
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  
  // Users submit an array of items (Composite Request)
  items: z.array(requestItemSchema).min(1, { message: "At least one inventory item is required for the request manifest." }),
  
  expiresAt: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Request deadline must be in the future.",
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
  content: z.string().min(1, { message: "Message payload cannot be empty." }),
});