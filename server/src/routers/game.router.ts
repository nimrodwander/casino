import type {
  CashOutResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  RollResponse,
} from '@casino/shared';
import { createSessionRequestSchema } from '@casino/shared';
import { NextFunction, Request, Response, Router } from 'express';
import { DEFAULT_REEL_COUNT } from '../../../shared/src/constants.js';
import { config } from '../config.js';
import { AppError } from '../errors/AppError.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { GameHistoryRepositoryService } from '../services/gameHistoryRepository.service.js';
import { SlotMachineService } from '../services/slotMachine.service.js';

export class GameRouter {
  public router: Router;
  private gameHistoryRepository: GameHistoryRepositoryService;
  private slotMachine = new SlotMachineService();

  constructor(gameHistoryRepository?: GameHistoryRepositoryService) {
    this.router = Router();
    this.gameHistoryRepository = gameHistoryRepository || new GameHistoryRepositoryService();

    this.router.post('/', validationMiddleware(createSessionRequestSchema), this.asyncHandler((req, res) => this.createSession(req, res)));
    this.router.post('/roll', this.asyncHandler((req, res) => this.roll(req, res)));
    this.router.post('/cashout', this.asyncHandler((req, res) => this.cashOut(req, res)));
  }

  private asyncHandler(fn: (req: Request, res: Response) => Promise<void> | void) {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res)).catch(next);
    };
  }

  private createSession(req: Request, res: Response): void {
    const { playerId } = req.body as CreateSessionRequest;
    const existing = req.session.gameSession;

    if (!existing) {
      req.session.gameSession = {
        playerId,
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
      throw new AppError(404, 'No active game session. Create a session first.');
    }

    if (gameSession.credits < config.rollCost) {
      throw new AppError(400, 'Not enough credits');
    }

    gameSession.credits -= config.rollCost;
    const result = this.slotMachine.roll(gameSession.credits, DEFAULT_REEL_COUNT);
    gameSession.credits += result.reward;

    res.json({ symbols: result.symbols, reward: result.reward, credits: gameSession.credits } satisfies RollResponse);
  }

  private async cashOut(req: Request, res: Response): Promise<void> {
    const gameSession = req.session.gameSession;

    if (!gameSession) {
      throw new AppError(404, 'No active game session');
    }

    const { credits, playerId } = gameSession;

    await this.gameHistoryRepository.persist(req.session.id, playerId, credits);
    req.session.destroy((err) => err && console.error('Error destroying session:', err));

    res.json({ credits, message: `Cashed out ${credits} credits. Thanks for playing!` } satisfies CashOutResponse);
  }
}
