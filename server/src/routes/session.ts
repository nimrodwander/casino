import { Router } from 'express';
import type {
  CreateSessionResponse,
  RollResponse,
  CashOutResponse,
  ErrorResponse,
} from '@casino/shared';
import { ROLL_COST } from '@casino/shared';
import {
  createGameSession,
  getGameSession,
  updateGameCredits,
  closeGameSession,
} from '../sessionConfig.js';
import { rollWithCheat } from '../services/slotMachine.js';
import { persistSession } from '../services/sessionStore.js';

const router = Router();

// POST /api/session — create a new game session
router.post('/', (req, res) => {
  const { playerId } = req.body as { playerId?: string };

  // Check if session already has an active game
  if (req.session.gameSession?.active) {
    const error: ErrorResponse = { error: 'Session already has an active game' };
    res.status(400).json(error);
    return;
  }

  createGameSession(req.session, playerId ?? '');

  const gameSession = getGameSession(req.session)!;
  const response: CreateSessionResponse = {
    sessionId: req.session.id,
    credits: gameSession.credits,
    playerId: gameSession.playerId,
  };
  res.status(201).json(response);
});

// POST /api/session/roll — roll the slot machine
router.post('/roll', (req, res) => {
  const gameSession = getGameSession(req.session);

  if (!gameSession) {
    const error: ErrorResponse = { error: 'No active game session. Create a session first.' };
    res.status(404).json(error);
    return;
  }

  if (!gameSession.active) {
    const error: ErrorResponse = { error: 'Session is closed' };
    res.status(400).json(error);
    return;
  }

  if (gameSession.credits < ROLL_COST) {
    const error: ErrorResponse = { error: 'Not enough credits' };
    res.status(400).json(error);
    return;
  }

  // Deduct roll cost
  updateGameCredits(req.session, -ROLL_COST);

  // Perform roll with potential cheat
  const result = rollWithCheat(gameSession.credits);

  // Add reward if won
  if (result.win) {
    updateGameCredits(req.session, result.reward);
  }

  const updatedSession = getGameSession(req.session)!;
  const response: RollResponse = {
    symbols: result.symbols,
    win: result.win,
    reward: result.reward,
    credits: updatedSession.credits,
  };
  res.json(response);
});

// POST /api/session/cashout — cash out and close session
router.post('/cashout', async (req, res) => {
  const gameSession = getGameSession(req.session);

  if (!gameSession) {
    const error: ErrorResponse = { error: 'No active game session' };
    res.status(404).json(error);
    return;
  }

  if (!gameSession.active) {
    const error: ErrorResponse = { error: 'Session is already closed' };
    res.status(400).json(error);
    return;
  }

  const finalCredits = gameSession.credits;

  // Persist to SQLite database
  await persistSession(req.session.id, gameSession.playerId, finalCredits);

  // Close the game session
  closeGameSession(req.session);

  // Destroy the express session
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
});

export default router;
