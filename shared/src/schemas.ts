import { z } from 'zod';

export const createSessionRequestSchema = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
});

export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;
