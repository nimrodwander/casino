import { Router, Request, Response } from 'express';
import type {
  CreateSessionResponse,
  RollResponse,
  CashOutResponse,
  ErrorResponse,
} from '@casino/shared';
import { GameSession } from '../services/gameSession.js';
import { SessionRepository } from '../services/sessionRepository.js';

export class SessionRouter {
  public router: Router;
  private sessionRepository: SessionRepository;

  constructor(sessionRepository?: SessionRepository) {
    this.router = Router();
    this.sessionRepository = sessionRepository || new SessionRepository();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', this.createSession.bind(this));
    this.router.post('/roll', this.roll.bind(this));
    this.router.post('/cashout', this.cashOut.bind(this));
  }

  private getGameSession(req: Request): GameSession | null {
    const sessionData = req.session.gameSession;
    if (!sessionData) {
      return null;
    }
    return new GameSession(
      req.session.id,
      sessionData.playerId,
      sessionData.credits
    );
  }

  private saveGameSession(req: Request, gameSession: GameSession): void {
    req.session.gameSession = {
      playerId: gameSession.playerId,
      credits: gameSession.credits,
    };
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

    const gameSession = new GameSession(req.session.id, playerId ?? '');
    this.saveGameSession(req, gameSession);

    const response: CreateSessionResponse = {
      sessionId: req.session.id,
      credits: gameSession.credits,
      playerId: gameSession.playerId,
    };
    res.status(201).json(response);
  }

  private roll(req: Request, res: Response): void {
    const gameSession = this.getGameSession(req);

    if (!gameSession) {
      const error: ErrorResponse = { error: 'No active game session. Create a session first.' };
      res.status(404).json(error);
      return;
    }

    if (!gameSession.canRoll()) {
      const error: ErrorResponse = { error: 'Not enough credits' };
      res.status(400).json(error);
      return;
    }

    const result = gameSession.roll();
    this.saveGameSession(req, gameSession);

    const response: RollResponse = {
      symbols: result.symbols,
      win: result.win,
      reward: result.reward,
      credits: gameSession.credits,
    };
    res.json(response);
  }

  private async cashOut(req: Request, res: Response): Promise<void> {
    const gameSession = this.getGameSession(req);

    if (!gameSession) {
      const error: ErrorResponse = { error: 'No active game session' };
      res.status(404).json(error);
      return;
    }

    const finalCredits = gameSession.cashOut();

    // Persist to database
    await this.sessionRepository.persist(
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
