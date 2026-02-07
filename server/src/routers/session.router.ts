import type {
  CashOutResponse,
  CreateSessionResponse,
  ErrorResponse,
  RollResponse,
} from '@casino/shared';
import { Request, Response, Router } from 'express';
import { config } from '../config.js';
import { GameHistoryRepositoryService } from '../services/gameHistoryRepository.service.js';
import { SlotMachineService } from '../services/slotMachine.service.js';

export class SessionRouter {
  public router: Router;
  private gameHistoryRepository: GameHistoryRepositoryService;
  private slotMachine = new SlotMachineService();

  constructor(gameHistoryRepository?: GameHistoryRepositoryService) {
    this.router = Router();
    this.gameHistoryRepository = gameHistoryRepository || new GameHistoryRepositoryService();

    this.router.post('/', (req, res) => this.createSession(req, res));
    this.router.post('/roll', (req, res) => this.roll(req, res));
    this.router.post('/cashout', (req, res) => this.cashOut(req, res));
  }

  private createSession(req: Request, res: Response): void {
    const { playerId } = req.body as { playerId?: string };
    const existing = req.session.gameSession;

    if (!existing) {
      req.session.gameSession = {
        playerId: playerId ?? '',
        credits: config.initialCredits,
      };
    }

    const session = req.session.gameSession;
    const response: CreateSessionResponse = {
      sessionId: req.session.id,
      credits: session?.credits || 0,
      playerId: session?.playerId || '',
    };
    res.status(existing ? 200 : 201).json(response);
  }

  private roll(req: Request, res: Response): void {
    const gameSession = req.session.gameSession;

    if (!gameSession) {
      res.status(404).json({ error: 'No active game session. Create a session first.' } satisfies ErrorResponse);
      return;
    }

    if (gameSession.credits < config.rollCost) {
      res.status(400).json({ error: 'Not enough credits' } satisfies ErrorResponse);
      return;
    }

    gameSession.credits -= config.rollCost;
    const result = this.slotMachine.roll(gameSession.credits, 3);
    gameSession.credits += result.reward;

    res.json({ symbols: result.symbols, reward: result.reward, credits: gameSession.credits } satisfies RollResponse);
  }

  private async cashOut(req: Request, res: Response): Promise<void> {
    const gameSession = req.session.gameSession;

    if (!gameSession) {
      res.status(404).json({ error: 'No active game session' } satisfies ErrorResponse);
      return;
    }

    const { credits, playerId } = gameSession;

    await this.gameHistoryRepository.persist(req.session.id, playerId, credits);
    req.session.destroy((err) => err && console.error('Error destroying session:', err));

    res.json({ credits, message: `Cashed out ${credits} credits. Thanks for playing!` } satisfies CashOutResponse);
  }
}
