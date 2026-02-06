import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { Box, Button, Stack } from '@mui/material';
import { ReelStrip } from './ReelStrip';
import { CashOutButton } from './CashOutButton';
import type { SlotSymbol } from '@casino/shared';
import { slotMachineStore } from '../stores/SlotMachineStore';
import { useReelReveal } from '../hooks/useReelReveal';

export const Game: React.FC = observer(() => {
  const REEL_STRIP_SIZE = 3;
  const store = slotMachineStore;
  const navigate = useNavigate();
  const { revealedCount, spinning, startReveal, resetReveal } = useReelReveal<SlotSymbol>();

  const handleRoll = async () => {
    if (spinning) return;
    const result = await store.roll();
    if (result) {
      startReveal([...result.symbols], () => runInAction(() => store.applyRollResult(result)));
    }
  };

  const handleReset = () => {
    resetReveal();
    store.reset();
    navigate('/');
  };

  const handleCashOut = async () => {
    await store.cashOut();
    resetReveal();
    store.reset();
    navigate('/');
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <ReelStrip
          count={REEL_STRIP_SIZE}
          symbols={store.symbols}
          revealedCount={revealedCount}
          spinning={spinning}
        />

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        {store.gameOver ? (
          <Button variant="contained" size="large" onClick={handleReset}>
            New Game
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              size="large"
              onClick={handleRoll}
              disabled={spinning || store.credits <= 0}
            >
              {spinning ? 'Rolling...' : 'Roll'}
            </Button>
            <CashOutButton
              onCashOut={handleCashOut}
              disabled={spinning}
            />
          </>
        )}
      </Stack>
    </Box>
  );
});
