import { z } from 'zod';

// Request schemas
export const createSessionRequestSchema = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
});

export const rollRequestSchema = z.object({});

export const cashOutRequestSchema = z.object({});

// Response schemas
export const createSessionResponseSchema = z.object({
  sessionId: z.string(),
  credits: z.number(),
  playerId: z.string(),
});

export const rollResponseSchema = z.object({
  symbols: z.array(z.string()),
  reward: z.number(),
  credits: z.number(),
});

export const cashOutResponseSchema = z.object({
  credits: z.number(),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

// Inferred types
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;
export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;
export type RollResponse = z.infer<typeof rollResponseSchema>;
export type CashOutResponse = z.infer<typeof cashOutResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
