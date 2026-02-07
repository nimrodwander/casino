import { Repository } from 'typeorm';
import { GameHistoryEntity } from '../entities/gameHistory.entity.js';
import { databaseService } from './database.service.js';

export class GameHistoryRepositoryService {
  private _repo: Repository<GameHistoryEntity> | null = null;

  constructor(repo?: Repository<GameHistoryEntity>) {
    if (repo) {
      this._repo = repo;
    }
  }

  private get repo(): Repository<GameHistoryEntity> {
    if (!this._repo) {
      this._repo = databaseService.getGameHistoryRepository();
    }
    return this._repo;
  }

  public async persist(
    sessionId: string,
    playerId: string,
    credits: number
  ): Promise<GameHistoryEntity> {
    const gameHistory = this.repo.create({
      id: sessionId,
      playerId,
      credits,
    });
    await this.repo.save(gameHistory);
    return gameHistory;
  }

  public async findById(id: string): Promise<GameHistoryEntity | null> {
    return this.repo.findOneBy({ id });
  }

  public async findByPlayerId(playerId: string): Promise<GameHistoryEntity[]> {
    return this.repo.findBy({ playerId });
  }

  public async clear(): Promise<void> {
    await this.repo.clear();
  }
}
