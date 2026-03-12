// server/src/middleware/sanitizer.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Recursive function to sanitize inputs based on key names and types.
 * @param key The field name (e.g., 'email', 'name')
 * @param value The value of the field
 * @returns The sanitized value
 */
const sanitizeValue = (key: string, value: any): any => {
  if (typeof value === 'string') {
    // 1. Global Trim: Remove leading/trailing spaces
    let sanitized = value.trim();

    // 2. Lowercase Emails
    if (key.toLowerCase().includes('email')) {
      return sanitized.toLowerCase();
    }

    // 3. Uppercase IDs, Codes, and Batches (for search/reference)
    if (
      key.toLowerCase().endsWith('id') ||
      key.toLowerCase().includes('code') ||
      key.toLowerCase().includes('batch')
    ) {
      return sanitized.toUpperCase();
    }

    // 4. Title Case for Names, Cities, Organizations, Food Names, Descriptions
    if (
      key.toLowerCase().includes('name') ||
      key.toLowerCase().includes('city') ||
      key.toLowerCase().includes('org') || // Matches organization
      key.toLowerCase().includes('title') ||
      key.toLowerCase().includes('description') ||
      key.toLowerCase().includes('address')
    ) {
      return sanitized
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    return sanitized;
  }

  // 5. Recursion for nested objects (e.g., address objects)
  if (typeof value === 'object' && value !== null) {
    // Handle Arrays
    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(key, item));
    }
    // Handle Objects
    const sanitizedObj: any = {};
    for (const [subKey, subValue] of Object.entries(value)) {
      sanitizedObj[subKey] = sanitizeValue(subKey, subValue);
    }
    return sanitizedObj;
  }

  return value;
};

/**
 * Global Middleware to intercept and clean req.body, req.query, and req.params
 */
export const globalSanitizer = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = sanitizeValue('root', req.body);
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    const sanitizedQuery = sanitizeValue('root', req.query);
    Object.assign(req.query, sanitizedQuery);
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    const sanitizedParams = sanitizeValue('root', req.params);
    Object.assign(req.params, sanitizedParams);
  }
  
  next();
};