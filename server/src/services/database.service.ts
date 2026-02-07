import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import { SessionEntity } from '../entities/Session.entity.js';

export class DatabaseService {
  private dataSource = new DataSource({
    type: 'better-sqlite3',
    database: process.env.DB_PATH || 'casino.db',
    synchronize: true,
    logging: false,
    entities: [SessionEntity],
  });

  public async initialize(): Promise<DataSource> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
    return this.dataSource;
  }

  public getSessionRepository(): Repository<SessionEntity> {
    return this.dataSource.getRepository(SessionEntity);
  }
}

export const databaseService = new DatabaseService();
