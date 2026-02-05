import React from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Reel } from './Reel';
import { CreditDisplay } from './CreditDisplay';
import { CashOutButton } from './CashOutButton';
import type { SlotSymbol } from '@casino/shared';
import { slotMachineStore } from '../stores/SlotMachineStore';
import { useReelReveal } from '../hooks/useReelReveal';

export const SlotMachine: React.FC = observer(() => {
  const store = slotMachineStore;
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
  };

  if (!store.sessionId) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Casino Jackpot
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Try your luck on the slots!
        </Typography>
        <Button variant="contained" size="large" onClick={() => store.startGame()}>
          Start Game
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Casino Jackpot
      </Typography>

      <CreditDisplay credits={store.credits} />

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
              onCashOut={() => store.cashOut()}
              disabled={spinning}
              />
          </>
        )}
      </Stack>
      
      {store.message && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {store.message}
        </Typography>
      )}

    </Box>
  );
});
