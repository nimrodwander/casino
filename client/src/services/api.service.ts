import type { CashOutResponse, CreateSessionResponse, RollResponse } from '@casino/shared';
import axios, { type AxiosInstance } from 'axios';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/game',
      withCredentials: true, // Required for cookie-based sessions
    });
  }

  public async createSession(playerId: string): Promise<CreateSessionResponse> {
    const { data } = await this.client.post<CreateSessionResponse>('', { playerId });
    return data;
  }

  public async roll(): Promise<RollResponse> {
    const { data } = await this.client.post<RollResponse>('/roll');
    return data;
  }

  public async cashOut(): Promise<CashOutResponse> {
    const { data } = await this.client.post<CashOutResponse>('/cashout');
    return data;
  }
}

export const apiService = new ApiService();
