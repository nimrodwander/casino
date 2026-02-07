import { Repository } from 'typeorm';
import { SessionEntity } from '../entities/Session.entity.js';
import { databaseService } from './database.service.js';

export class SessionRepositoryService {
  private _repo: Repository<SessionEntity> | null = null;

  constructor(repo?: Repository<SessionEntity>) {
    if (repo) {
      this._repo = repo;
    }
  }

  private get repo(): Repository<SessionEntity> {
    if (!this._repo) {
      this._repo = databaseService.getSessionRepository();
    }
    return this._repo;
  }

  public async persist(
    sessionId: string,
    playerId: string,
    credits: number
  ): Promise<SessionEntity> {
    const session = this.repo.create({
      id: sessionId,
      playerId,
      credits,
      active: false,
    });
    await this.repo.save(session);
    return session;
  }

  public async findById(id: string): Promise<SessionEntity | null> {
    return this.repo.findOneBy({ id });
  }

  public async findByPlayerId(playerId: string): Promise<SessionEntity[]> {
    return this.repo.findBy({ playerId });
  }

  public async clear(): Promise<void> {
    await this.repo.clear();
  }
}
