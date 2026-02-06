import axios, { type AxiosInstance } from 'axios';
import type { CreateSessionResponse, RollResponse, CashOutResponse } from '@casino/shared';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({ baseURL: '/api/session' });
  }

  async createSession(playerId: string): Promise<CreateSessionResponse> {
    const { data } = await this.client.post<CreateSessionResponse>('', { playerId });
    return data;
  }

  async roll(sessionId: string): Promise<RollResponse> {
    const { data } = await this.client.post<RollResponse>(`/${sessionId}/roll`);
    return data;
  }

  async cashOut(sessionId: string): Promise<CashOutResponse> {
    const { data } = await this.client.post<CashOutResponse>(`/${sessionId}/cashout`);
    return data;
  }
}

export const apiService = new ApiService();