import { useReducer, useCallback, useRef } from 'react';
import type { SymbolTriplet } from '@casino/shared';
import * as api from '../api/client';

interface GameState {
  sessionId: string | null;
  credits: number;
  symbols: SymbolTriplet | null;
  revealedCount: number;
  spinning: boolean;
  rolling: boolean;
  message: string | null;
  gameOver: boolean;
}

type GameAction =
  | { type: 'SESSION_CREATED'; sessionId: string; credits: number }
  | { type: 'ROLL_START' }
  | { type: 'ROLL_RESULT'; symbols: SymbolTriplet }
  | { type: 'REVEAL_NEXT' }
  | { type: 'ROLL_COMPLETE'; credits: number; win: boolean; reward: number }
  | { type: 'CASH_OUT'; credits: number; message: string }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

const initialState: GameState = {
  sessionId: null,
  credits: 0,
  symbols: null,
  revealedCount: 0,
  spinning: false,
  rolling: false,
  message: null,
  gameOver: false,
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SESSION_CREATED':
      return {
        ...initialState,
        sessionId: action.sessionId,
        credits: action.credits,
      };
    case 'ROLL_START':
      return {
        ...state,
        spinning: true,
        rolling: true,
        revealedCount: 0,
        symbols: null,
        message: null,
      };
    case 'ROLL_RESULT':
      return {
        ...state,
        symbols: action.symbols,
        rolling: false,
      };
    case 'REVEAL_NEXT':
      return {
        ...state,
        revealedCount: state.revealedCount + 1,
      };
    case 'ROLL_COMPLETE':
      return {
        ...state,
        spinning: false,
        credits: action.credits,
        message: action.win
          ? `You won ${action.reward} credits!`
          : 'No luck this time.',
        gameOver: action.credits <= 0,
      };
    case 'CASH_OUT':
      return {
        ...state,
        gameOver: true,
        message: action.message,
      };
    case 'ERROR':
      return {
        ...state,
        spinning: false,
        rolling: false,
        message: action.message,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useSlotMachine() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startGame = useCallback(async () => {
    try {
      clearTimers();
      const { sessionId, credits } = await api.createSession();
      dispatch({ type: 'SESSION_CREATED', sessionId, credits });
    } catch {
      dispatch({ type: 'ERROR', message: 'Failed to start game.' });
    }
  }, [clearTimers]);

  const rollSlots = useCallback(async () => {
    if (!state.sessionId || state.spinning || state.gameOver) return;

    dispatch({ type: 'ROLL_START' });

    try {
      const result = await api.roll(state.sessionId);

      dispatch({ type: 'ROLL_RESULT', symbols: result.symbols });

      // Staggered reveal: 1s, 2s, 3s
      const t1 = setTimeout(() => dispatch({ type: 'REVEAL_NEXT' }), 1000);
      const t2 = setTimeout(() => dispatch({ type: 'REVEAL_NEXT' }), 2000);
      const t3 = setTimeout(() => {
        dispatch({ type: 'REVEAL_NEXT' });
        dispatch({
          type: 'ROLL_COMPLETE',
          credits: result.credits,
          win: result.win,
          reward: result.reward,
        });
      }, 3000);

      timersRef.current = [t1, t2, t3];
    } catch {
      dispatch({ type: 'ERROR', message: 'Roll failed. Try again.' });
    }
  }, [state.sessionId, state.spinning, state.gameOver]);

  const cashOutCredits = useCallback(async () => {
    if (!state.sessionId || state.spinning) return;

    try {
      const result = await api.cashOut(state.sessionId);
      dispatch({ type: 'CASH_OUT', credits: result.credits, message: result.message });
    } catch {
      dispatch({ type: 'ERROR', message: 'Cash out failed.' });
    }
  }, [state.sessionId, state.spinning]);

  const resetGame = useCallback(() => {
    clearTimers();
    dispatch({ type: 'RESET' });
  }, [clearTimers]);

  return {
    ...state,
    startGame,
    rollSlots,
    cashOutCredits,
    resetGame,
  };
}
