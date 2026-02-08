import type { CreateSessionRequest } from '@casino/shared';
import {
  cashOutDataSchema,
  cashOutRequestSchema,
  createSessionDataSchema,
  createSessionRequestSchema,
  rollDataSchema,
  rollRequestSchema,
} from '@casino/shared';
import { Request, Response, Router } from 'express';
import { DEFAULT_REEL_COUNT } from '../../../shared/src/constants.js';
import { config } from '../config.js';
import { AppError } from '../errors/AppError.js';
import { BadRequestError } from '../errors/BadRequestError.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import { requestValidationMiddleware } from '../middlewares/requestValidation.middleware.js';
import { responseValidationMiddleware } from '../middlewares/responseValidation.middleware.js';
import { GameHistoryRepositoryService } from '../services/gameHistoryRepository.service.js';
import { SlotMachineService } from '../services/slotMachine.service.js';

export class GameRouter {
  public router: Router;
  private gameHistoryRepository = new GameHistoryRepositoryService();
  private slotMachine = new SlotMachineService();

  constructor() {
    this.router = Router();

    this.router.post(
      '/',
      requestValidationMiddleware(createSessionRequestSchema),
      responseValidationMiddleware(createSessionDataSchema),
      asyncHandler(this.createSession.bind(this))
    );
    this.router.post(
      '/roll',
      requestValidationMiddleware(rollRequestSchema),
      responseValidationMiddleware(rollDataSchema),
      asyncHandler(this.roll.bind(this))
    );
    this.router.post(
      '/cashout',
      requestValidationMiddleware(cashOutRequestSchema),
      responseValidationMiddleware(cashOutDataSchema),
      asyncHandler(this.cashOut.bind(this))
    );
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
    res.status(existing ? 200 : 201).json({
      data: {
        sessionId: req.session.id,
        credits: session?.credits || 0,
        playerId: session?.playerId || '',
      },
    });
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

    res.json({
      data: {
        symbols: result.symbols,
        reward: result.reward,
        credits: gameSession.credits,
      },
    });
  }

  private async cashOut(req: Request, res: Response): Promise<void> {
    const gameSession = req.session.gameSession;

    if (!gameSession) {
      throw new NotFoundError('No active game session');
    }

    await this.gameHistoryRepository.persist(req.session.id, gameSession.playerId, gameSession.credits);
    req.session.destroy((err) => {
      if (err) throw new AppError(500, 'Failed to destroy session');
    });

    res.json({
      data: { credits: gameSession.credits },
      message: `Cashed out ${gameSession.credits} credits. Thanks for playing!`,
    });
  }
}
