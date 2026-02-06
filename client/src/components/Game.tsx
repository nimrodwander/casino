import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { Box, Button, Stack } from '@mui/material';
import { Reel } from './Reel';
import { CashOutButton } from './CashOutButton';
import type { SlotSymbol } from '@casino/shared';
import { slotMachineStore } from '../stores/SlotMachineStore';
import { useReelReveal } from '../hooks/useReelReveal';

export const Game: React.FC = observer(() => {
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
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        {[0, 1, 2].map((index) => (
          <Reel
            key={index}
            symbol={store.symbols ? store.symbols[index] : null}
            revealed={revealedCount > index}
            spinning={spinning}
          />
        ))}
      </Stack>

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
