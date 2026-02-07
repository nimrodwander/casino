import { Router, Request, Response } from 'express';
import type {
  CreateSessionResponse,
  RollResponse,
  CashOutResponse,
  ErrorResponse,
} from '@casino/shared';
import { INITIAL_CREDITS, ROLL_COST } from '@casino/shared';
import { SlotMachineService } from '../services/slotMachine.service.js';
import { GameHistoryRepositoryService } from '../services/gameHistoryRepository.service.js';

export class SessionRouter {
  public router: Router;
  private gameHistoryRepository: GameHistoryRepositoryService;
  private slotMachine: SlotMachineService;

  constructor(gameHistoryRepository?: GameHistoryRepositoryService) {
    this.router = Router();
    this.gameHistoryRepository = gameHistoryRepository || new GameHistoryRepositoryService();
    this.slotMachine = new SlotMachineService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', this.createSession.bind(this));
    this.router.post('/roll', this.roll.bind(this));
    this.router.post('/cashout', this.cashOut.bind(this));
  }

  private createSession(req: Request, res: Response): void {
    const { playerId } = req.body as { playerId?: string };

    // If session already exists, return it instead of error
    if (req.session.gameSession) {
      const response: CreateSessionResponse = {
        sessionId: req.session.id,
        credits: req.session.gameSession.credits,
        playerId: req.session.gameSession.playerId,
      };
      res.status(200).json(response);
      return;
    }

    req.session.gameSession = {
      playerId: playerId ?? '',
      credits: INITIAL_CREDITS,
    };

    const response: CreateSessionResponse = {
      sessionId: req.session.id,
      credits: INITIAL_CREDITS,
      playerId: playerId ?? '',
    };
    res.status(201).json(response);
  }

  private roll(req: Request, res: Response): void {
    const gameSession = req.session.gameSession;

    if (!gameSession) {
      const error: ErrorResponse = { error: 'No active game session. Create a session first.' };
      res.status(404).json(error);
      return;
    }

    if (gameSession.credits < ROLL_COST) {
      const error: ErrorResponse = { error: 'Not enough credits' };
      res.status(400).json(error);
      return;
    }

    gameSession.credits -= ROLL_COST;
    const reelCount = 3;
    const result = this.slotMachine.roll(gameSession.credits, reelCount);

    if (result.win) {
      gameSession.credits += result.reward;
    }

    const response: RollResponse = {
      symbols: result.symbols,
      win: result.win,
      reward: result.reward,
      credits: gameSession.credits,
    };
    res.json(response);
  }

  private async cashOut(req: Request, res: Response): Promise<void> {
    const gameSession = req.session.gameSession;

    if (!gameSession) {
      const error: ErrorResponse = { error: 'No active game session' };
      res.status(404).json(error);
      return;
    }

    const finalCredits = gameSession.credits;

    // Persist to database
    await this.gameHistoryRepository.persist(
      req.session.id,
      gameSession.playerId,
      finalCredits
    );

    // Destroy express session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    });

    const response: CashOutResponse = {
      credits: finalCredits,
      message: `Cashed out ${finalCredits} credits. Thanks for playing!`,
    };
    res.json(response);
  }
}

// Default export for backwards compatibility
const sessionRouter = new SessionRouter();
export default sessionRouter.router;
