import { z } from 'zod';
import {
  cashOutDataSchema,
  rollDataSchema,
  startGameDataSchema,
  startGameRequestSchema,
} from './schemas.js';

// Requests
export type CreateSessionRequest = z.infer<typeof startGameRequestSchema>;

// Response generic schema
export type Response<T = unknown> = {
  data: T;
  message?: string;
};

// Responses enveloped data
export type CreateSessionData = z.infer<typeof startGameDataSchema>;
export type RollData = z.infer<typeof rollDataSchema>;
export type CashOutData = z.infer<typeof cashOutDataSchema>;
