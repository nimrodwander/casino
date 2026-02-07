import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { BadRequestError } from '../errors/index.js';

export function validationMiddleware(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues[0].message;
      next(new BadRequestError(message));
      return;
    }

    req.body = result.data;
    next();
  };
}
