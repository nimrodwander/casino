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
router.post('/', async (req, res) => {
  const { playerId } = req.body as { playerId?: string };
  const session = await createSession(playerId ?? '');
  const response: CreateSessionResponse = {
    sessionId: session.id,
    credits: session.credits,
    playerId: session.playerId,
  };
  res.status(201).json(response);
});

// POST /api/session/:id/roll — roll the slot machine
router.post('/:id/roll', async (req, res) => {
  const { id } = req.params;
  const session = await getSession(id);

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
  await updateCredits(id, -ROLL_COST);

  // Perform roll with potential cheat
  const result = rollWithCheat(session.credits);

  // Add reward if won
  if (result.win) {
    await updateCredits(id, result.reward);
  }

  // Fetch updated session to get current credits
  const updatedSession = await getSession(id);

  const response: RollResponse = {
    symbols: result.symbols,
    win: result.win,
    reward: result.reward,
    credits: updatedSession!.credits,
  };
  res.json(response);
});

// POST /api/session/:id/cashout — cash out and close session
router.post('/:id/cashout', async (req, res) => {
  const { id } = req.params;
  const session = await getSession(id);

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
  await closeSession(id);

  const response: CashOutResponse = {
    credits: finalCredits,
    message: `Cashed out ${finalCredits} credits. Thanks for playing!`,
  };
  res.json(response);
});

export default router;
