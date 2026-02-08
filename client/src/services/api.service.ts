import type { CashOutData, CreateSessionData, Response, RollData } from '@casino/shared';
import axios, { type AxiosInstance } from 'axios';
import { errorStore } from '../stores/error.store';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/game/games',
      withCredentials: true,
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
    const { data } = await this.client.post<Response<CreateSessionData>>('/current', { playerId });
    return data.data;
  }

  public async roll(): Promise<RollData> {
    const { data } = await this.client.post<Response<RollData>>('/current/roll');
    return data.data;
  }

  public async cashOut(): Promise<CashOutData> {
    const { data } = await this.client.post<Response<CashOutData>>('/current/persist');
    return data.data;
  }
}

export const apiService = new ApiService();
