export const SYMBOLS: Record<string, number> = {
  cherry: 10,
  lemon: 20,
  orange: 30,
  watermelon: 40,
};

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
  symbols: string[];
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
