import type { CreateSessionResponse, RollResponse, CashOutResponse } from '@casino/shared';

const BASE_URL = '/api/session';

export async function createSession(): Promise<CreateSessionResponse> {
  const res = await fetch(BASE_URL, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Failed to create session: ${res.statusText}`);
  }
  return res.json();
}

export async function roll(sessionId: string): Promise<RollResponse> {
  const res = await fetch(`${BASE_URL}/${sessionId}/roll`, { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Roll failed: ${res.statusText}`);
  }
  return res.json();
}

export async function cashOut(sessionId: string): Promise<CashOutResponse> {
  const res = await fetch(`${BASE_URL}/${sessionId}/cashout`, { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Cash out failed: ${res.statusText}`);
  }
  return res.json();
}
