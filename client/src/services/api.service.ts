import type { CashOutResponse, CreateSessionResponse, Response, RollResponse } from '@casino/shared';
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
        const message = (error.response?.data as Response)?.error || error.message;
        errorStore.setError(message);
        return Promise.reject(error);
      },
    );
  }

  public async createSession(playerId: string): Promise<CreateSessionResponse> {
    const { data } = await this.client.post<Response>('', { playerId });
    return data.data as CreateSessionResponse;
  }

  public async roll(): Promise<RollResponse> {
    const { data } = await this.client.post<Response>('/roll');
    return data.data as RollResponse;
  }

  public async cashOut(): Promise<CashOutResponse> {
    const { data } = await this.client.post<Response>('/cashout');
    return data.data as CashOutResponse;
  }
}

export const apiService = new ApiService();
