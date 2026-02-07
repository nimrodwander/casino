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
