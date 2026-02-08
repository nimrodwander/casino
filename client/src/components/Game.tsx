import { Box, Button, Stack } from '@mui/material';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_REEL_COUNT } from '../../../shared/src/constants';
import { useReelReveal } from '../hooks/useReelReveal';
import { gameStore } from '../stores/GameStore';
import { ReelStrip } from './ReelStrip';

export const Game: React.FC = observer(() => {
  const store = gameStore;
  const navigate = useNavigate();
  const { revealedCount, spinning, startReveal, resetReveal } = useReelReveal<string>();

  const handleRoll = async (): Promise<void> => {
    if (spinning) return;
    const result = await store.roll();
    if (result) {
      startReveal([...result.symbols], () => runInAction(() => store.applyRollResult(result)));
    }
  };

  const handleCashOut = async (): Promise<void> => {
    await store.cashOut();
    resetReveal();
    store.reset();
    navigate('/');
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <ReelStrip
          count={store.symbols?.length ?? DEFAULT_REEL_COUNT}
          symbols={store.symbols}
          revealedCount={revealedCount}
          spinning={spinning}
        />

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleRoll}
            disabled={spinning || store.credits <= 0}
          >
            {spinning ? 'Rolling...' : 'Roll'}
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleCashOut}
            disabled={spinning}
          >
            Cash Out
          </Button>
      </Stack>
    </Box>
  );
});
