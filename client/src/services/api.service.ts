import type { CashOutData, CreateSessionData, Response, RollData } from '@casino/shared';
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
        const message = (error.response?.data as Response)?.message || error.message;
        errorStore.setError(message);
        return Promise.reject(error);
      },
    );
  }

  public async createSession(playerId: string): Promise<CreateSessionData> {
    const { data } = await this.client.post<Response>('', { playerId });
    return data.data as CreateSessionData;
  }

  public async roll(): Promise<RollData> {
    const { data } = await this.client.post<Response>('/roll');
    return data.data as RollData;
  }

  public async cashOut(): Promise<CashOutData> {
    const { data } = await this.client.post<Response>('/cashout');
    return data.data as CashOutData;
  }
}

export const apiService = new ApiService();
