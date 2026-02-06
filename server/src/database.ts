import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Session } from './entities/Session.js';

let dataSource: DataSource | null = null;

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_PATH || 'casino.db',
  synchronize: true,
  logging: false,
  entities: [Session],
});

export async function initializeDatabase(customDataSource?: DataSource): Promise<DataSource> {
  if (customDataSource) {
    dataSource = customDataSource;
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    return dataSource;
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  dataSource = AppDataSource;
  return dataSource;
}

export function getSessionRepository() {
  if (!dataSource) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return dataSource.getRepository(Session);
}

export function getDataSource(): DataSource | null {
  return dataSource;
}

export function setDataSource(ds: DataSource): void {
  dataSource = ds;
}
