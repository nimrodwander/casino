import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { GameHistoryEntity } from '../entities/gameHistory.entity.js';
import { databaseService } from '../services/database.service.js';
import { GameHistoryRepositoryService } from '../services/gameHistoryRepository.service.js';

let testDataSource: DataSource;
let gameHistoryRepository: GameHistoryRepositoryService;

beforeAll(async () => {
  testDataSource = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [GameHistoryEntity],
  });
  await testDataSource.initialize();

  // Override databaseService to use test database
  databaseService.getGameHistoryRepository = (): Repository<GameHistoryEntity> =>
    testDataSource.getRepository(GameHistoryEntity);
  gameHistoryRepository = new GameHistoryRepositoryService();
});

afterAll(async () => {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
});

describe('GameHistoryRepositoryService', () => {
  beforeEach(async () => {
    await gameHistoryRepository.clear();
  });

  describe('persist', () => {
    it('should persist a game history with given data', async () => {
      const gameHistory = await gameHistoryRepository.persist('session-123', 'player-1', 50);
      expect(gameHistory.id).toBe('session-123');
      expect(gameHistory.playerId).toBe('player-1');
      expect(gameHistory.credits).toBe(50);
    });

    it('should store the game history in the database', async () => {
      await gameHistoryRepository.persist('session-456', 'player-2', 100);
      const fetched = await gameHistoryRepository.findById('session-456');
      expect(fetched).not.toBeNull();
      expect(fetched!.playerId).toBe('player-2');
      expect(fetched!.credits).toBe(100);
    });
  });

  describe('findById', () => {
    it('should return the game history by id', async () => {
      await gameHistoryRepository.persist('session-789', 'player-3', 25);
      const fetched = await gameHistoryRepository.findById('session-789');
      expect(fetched).not.toBeNull();
      expect(fetched!.id).toBe('session-789');
    });

    it('should return null for nonexistent id', async () => {
      const fetched = await gameHistoryRepository.findById('nonexistent');
      expect(fetched).toBeNull();
    });
  });

  describe('findByPlayerId', () => {
    it('should return all game history for a player', async () => {
      await gameHistoryRepository.persist('session-1', 'player-x', 10);
      await gameHistoryRepository.persist('session-2', 'player-x', 20);
      await gameHistoryRepository.persist('session-3', 'player-y', 30);

      const playerXHistory = await gameHistoryRepository.findByPlayerId('player-x');
      expect(playerXHistory).toHaveLength(2);
      expect(playerXHistory.map((s) => s.credits).sort()).toEqual([10, 20]);
    });

    it('should return empty array for player with no history', async () => {
      const history = await gameHistoryRepository.findByPlayerId('no-history-player');
      expect(history).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should remove all game history', async () => {
      await gameHistoryRepository.persist('session-a', 'player-1', 10);
      await gameHistoryRepository.persist('session-b', 'player-2', 20);

      await gameHistoryRepository.clear();

      const history1 = await gameHistoryRepository.findById('session-a');
      const history2 = await gameHistoryRepository.findById('session-b');
      expect(history1).toBeNull();
      expect(history2).toBeNull();
    });
  });
});
