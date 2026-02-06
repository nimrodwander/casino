import axios, { type AxiosInstance } from 'axios';
import type { CreateSessionResponse, RollResponse, CashOutResponse } from '@casino/shared';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/session',
      withCredentials: true, // Required for cookie-based sessions
    });
  }

  async createSession(playerId: string): Promise<CreateSessionResponse> {
    const { data } = await this.client.post<CreateSessionResponse>('', { playerId });
    return data;
  }

  async roll(): Promise<RollResponse> {
    const { data } = await this.client.post<RollResponse>('/roll');
    return data;
  }

  async cashOut(): Promise<CashOutResponse> {
    const { data } = await this.client.post<CashOutResponse>('/cashout');
    return data;
  }
}

export const apiService = new ApiService();
