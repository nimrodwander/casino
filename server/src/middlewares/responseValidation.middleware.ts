import { responseSchema } from '@casino/shared';
import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export function responseValidationMiddleware(dataSchema?: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown): Response {
      // Validate envelope structure
      const validatedEnvelope = responseSchema.parse(body);
      
      // Validate data content if schema provided and status is success (< 400)
      if (dataSchema && res.statusCode < 400) {
        validatedEnvelope.data = dataSchema.parse(validatedEnvelope.data);
      }
      
      return originalJson(validatedEnvelope);
    };

    next();
  };
}
