export type SlotSymbol = 'C' | 'L' | 'O' | 'W';

export const SYMBOL_REWARDS: Record<SlotSymbol, number> = {
  C: 10,
  L: 20,
  O: 30,
  W: 40,
};

export const SYMBOL_NAMES: Record<SlotSymbol, string> = {
  C: 'Cherry',
  L: 'Lemon',
  O: 'Orange',
  W: 'Watermelon',
};

export const ALL_SYMBOLS: SlotSymbol[] = ['C', 'L', 'O', 'W'];

export const INITIAL_CREDITS = 10;
export const ROLL_COST = 1;

// Cheat thresholds
export const CHEAT_THRESHOLD_LOW = 40;
export const CHEAT_THRESHOLD_HIGH = 60;
export const CHEAT_CHANCE_LOW = 0.3;
export const CHEAT_CHANCE_HIGH = 0.6;

// API request types
export interface CreateSessionRequest {
  playerId: string;
}

// API response types
export interface CreateSessionResponse {
  sessionId: string;
  credits: number;
  playerId: string;
}

export interface RollResponse {
  symbols: SlotSymbol[];
  reward: number;
  credits: number;
}

export interface CashOutResponse {
  credits: number;
  message: string;
}

export interface ErrorResponse {
  error: string;
}
