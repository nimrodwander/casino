import { Router } from 'express';
import type {
  CreateSessionResponse,
  RollResponse,
  CashOutResponse,
  ErrorResponse,
} from '@casino/shared';
import { ROLL_COST } from '@casino/shared';
import { createSession, getSession, updateCredits, closeSession } from '../services/sessionStore.js';
import { rollWithCheat } from '../services/slotMachine.js';

const router = Router();

// POST /api/session — create a new game session
router.post('/', (_req, res) => {
  const session = createSession();
  const response: CreateSessionResponse = {
    sessionId: session.id,
    credits: session.credits,
  };
  res.status(201).json(response);
});

// POST /api/session/:id/roll — roll the slot machine
router.post('/:id/roll', (req, res) => {
  const { id } = req.params;
  const session = getSession(id);

  if (!session) {
    const error: ErrorResponse = { error: 'Session not found' };
    res.status(404).json(error);
    return;
  }

  if (!session.active) {
    const error: ErrorResponse = { error: 'Session is closed' };
    res.status(400).json(error);
    return;
  }

  if (session.credits < ROLL_COST) {
    const error: ErrorResponse = { error: 'Not enough credits' };
    res.status(400).json(error);
    return;
  }

  // Deduct roll cost
  updateCredits(id, -ROLL_COST);

  // Perform roll with potential cheat
  const result = rollWithCheat(session.credits);

  // Add reward if won
  if (result.win) {
    updateCredits(id, result.reward);
  }

  const response: RollResponse = {
    symbols: result.symbols,
    win: result.win,
    reward: result.reward,
    credits: session.credits,
  };
  res.json(response);
});

// POST /api/session/:id/cashout — cash out and close session
router.post('/:id/cashout', (req, res) => {
  const { id } = req.params;
  const session = getSession(id);

  if (!session) {
    const error: ErrorResponse = { error: 'Session not found' };
    res.status(404).json(error);
    return;
  }

  if (!session.active) {
    const error: ErrorResponse = { error: 'Session is already closed' };
    res.status(400).json(error);
    return;
  }

  const finalCredits = session.credits;
  closeSession(id);

  const response: CashOutResponse = {
    credits: finalCredits,
    message: `Cashed out ${finalCredits} credits. Thanks for playing!`,
  };
  res.json(response);
});

export default router;
