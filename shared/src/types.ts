import { z } from 'zod';
import {
  cashOutDataSchema,
  createSessionDataSchema,
  createSessionRequestSchema,
  rollDataSchema,
} from './schemas.js';

// Requests
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;

// Response generic schema
export type Response<T = unknown> = {
  data: T;
  message?: string;
};

// Responses enveloped data
export type CreateSessionData = z.infer<typeof createSessionDataSchema>;
export type RollData = z.infer<typeof rollDataSchema>;
export type CashOutData = z.infer<typeof cashOutDataSchema>;
