import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SessionEntity } from '../entities/Session.entity.js';

export class DatabaseService {
  private dataSource = new DataSource({
    type: 'better-sqlite3',
    database: process.env.DB_PATH || 'casino.db',
    synchronize: true,
    logging: false,
    entities: [SessionEntity],
  });

  async initialize(): Promise<DataSource> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
    return this.dataSource;
  }

  getSessionRepository() {
    return this.dataSource.getRepository(SessionEntity);
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  setDataSource(ds: DataSource): void {
    this.dataSource = ds;
  }
}

export const databaseService = new DatabaseService();
