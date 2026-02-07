import type { CreateSessionRequest } from '@casino/shared';
import {
  cashOutRequestSchema,
  cashOutResponseSchema,
  createSessionRequestSchema,
  createSessionResponseSchema,
  rollRequestSchema,
  rollResponseSchema,
} from '@casino/shared';
import { NextFunction, Request, Response, Router } from 'express';
import { DEFAULT_REEL_COUNT } from '../../../shared/src/constants.js';
import { config } from '../config.js';
import { BadRequestError } from '../errors/BadRequestError.js';
import { NotFoundError } from '../errors/NotFoundError.js';
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
    this.router.post('/roll', validationMiddleware(rollRequestSchema), this.asyncHandler((req, res) => this.roll(req, res)));
    this.router.post('/cashout', validationMiddleware(cashOutRequestSchema), this.asyncHandler((req, res) => this.cashOut(req, res)));
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
    const response = createSessionResponseSchema.parse({
      sessionId: req.session.id,
      credits: session?.credits || 0,
      playerId: session?.playerId || '',
    });
    res.status(existing ? 200 : 201).json(response);
  }

  private roll(req: Request, res: Response): void {
    const gameSession = req.session.gameSession;

    if (!gameSession) {
      throw new NotFoundError('No active game session. Create a session first.');
    }

    if (gameSession.credits < config.rollCost) {
      throw new BadRequestError('Not enough credits');
    }

    gameSession.credits -= config.rollCost;
    const result = this.slotMachine.roll(gameSession.credits, DEFAULT_REEL_COUNT);
    gameSession.credits += result.reward;

    const response = rollResponseSchema.parse({
      symbols: result.symbols,
      reward: result.reward,
      credits: gameSession.credits,
    });
    res.json(response);
  }

  private async cashOut(req: Request, res: Response): Promise<void> {
    const gameSession = req.session.gameSession;

    if (!gameSession) {
      throw new NotFoundError('No active game session');
    }

    const { credits, playerId } = gameSession;

    await this.gameHistoryRepository.persist(req.session.id, playerId, credits);
    req.session.destroy((err) => err && console.error('Error destroying session:', err));

    const response = cashOutResponseSchema.parse({
      credits,
      message: `Cashed out ${credits} credits. Thanks for playing!`,
    });
    res.json(response);
  }
}
