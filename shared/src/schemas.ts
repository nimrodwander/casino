import { z } from 'zod';

// Request schemas
export const createSessionRequestSchema = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
});

export const rollRequestSchema = z.object({});

export const cashOutRequestSchema = z.object({});

// Response data schemas
export const createSessionDataSchema = z.object({
  sessionId: z.string(),
  credits: z.number(),
  playerId: z.string(),
});

export const rollDataSchema = z.object({
  symbols: z.array(z.string()),
  reward: z.number(),
  credits: z.number(),
});

export const cashOutDataSchema = z.object({
  credits: z.number(),
});

// Envelope schema
export const responseSchema = z.object({
  data: z.unknown(),
  message: z.string().optional(),
});

// Inferred types
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;
export type CreateSessionData = z.infer<typeof createSessionDataSchema>;
export type RollData = z.infer<typeof rollDataSchema>;
export type CashOutData = z.infer<typeof cashOutDataSchema>;
export type Response = z.infer<typeof responseSchema>;
