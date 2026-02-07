import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import { GameHistoryEntity } from '../entities/gameHistory.entity.js';

export class DatabaseService {
  private dataSource = new DataSource({
    type: 'better-sqlite3',
    database: process.env.DB_PATH || 'casino.db',
    synchronize: true,
    logging: false,
    entities: [GameHistoryEntity],
  });

  public async initialize(): Promise<DataSource> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
    return this.dataSource;
  }

  public getGameHistoryRepository(): Repository<GameHistoryEntity> {
    return this.dataSource.getRepository(GameHistoryEntity);
  }
}

export const databaseService = new DatabaseService();
