import type { ErrorResponse } from '@casino/shared';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message } satisfies ErrorResponse);
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' } satisfies ErrorResponse);
}
