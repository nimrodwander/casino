import { Repository } from 'typeorm';
import { Session } from '../entities/Session.js';
import { getSessionRepository } from '../database.js';

export class SessionRepository {
  private _repo: Repository<Session> | null = null;

  constructor(repo?: Repository<Session>) {
    if (repo) {
      this._repo = repo;
    }
  }

  private get repo(): Repository<Session> {
    if (!this._repo) {
      this._repo = getSessionRepository();
    }
    return this._repo;
  }

  async persist(
    sessionId: string,
    playerId: string,
    credits: number
  ): Promise<Session> {
    const session = this.repo.create({
      id: sessionId,
      playerId,
      credits,
      active: false,
    });
    await this.repo.save(session);
    return session;
  }

  async findById(id: string): Promise<Session | null> {
    return this.repo.findOneBy({ id });
  }

  async findByPlayerId(playerId: string): Promise<Session[]> {
    return this.repo.findBy({ playerId });
  }

  async clear(): Promise<void> {
    await this.repo.clear();
  }
}
