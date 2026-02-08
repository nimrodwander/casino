import { makeAutoObservable } from 'mobx';

export class ErrorStore {
  public error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  public setError(message: string): void {
    this.error = message;
  }

  public clearError(): void {
    this.error = null;
  }
}

export const errorStore = new ErrorStore();
