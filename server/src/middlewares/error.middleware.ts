import { errorResponseSchema } from '@casino/shared';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ZodError) {
    const message = err.issues[0]?.message || 'Validation error';
    const response = errorResponseSchema.parse({ error: message });
    res.status(400).json(response);
    return;
  }

if (err instanceof AppError) {
    const response = errorResponseSchema.parse({ error: err.message });
    res.status(err.statusCode).json(response);  
    return;
  }

  console.error('Unexpected error:', err);
  const response = errorResponseSchema.parse({ error: 'Internal server error' });
  res.status(500).json(response);
}
