import type { CashOutResponse, CreateSessionResponse, ErrorResponse, RollResponse } from '@casino/shared';
import axios, { type AxiosInstance } from 'axios';
import { errorStore } from '../stores/ErrorStore';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/game',
      withCredentials: true, // Required for cookie-based sessions
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = (error.response?.data as ErrorResponse)?.error || error.message;
        errorStore.setError(message);
        return Promise.reject(error);
      },
    );
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
