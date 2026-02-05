import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Reel } from './Reel';
import { CreditDisplay } from './CreditDisplay';
import { CashOutButton } from './CashOutButton';
import { slotMachineStore } from '../stores/SlotMachineStore';

export const SlotMachine: React.FC = observer(() => {
  const store = slotMachineStore;

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
            revealed={store.revealedCount > index}
            spinning={store.spinning}
          />
        ))}
      </Stack>

      {store.message && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {store.message}
        </Typography>
      )}

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        {store.gameOver ? (
          <Button variant="contained" size="large" onClick={() => store.reset()}>
            New Game
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              size="large"
              onClick={() => store.rollSlots()}
              disabled={store.spinning || store.credits <= 0}
            >
              {store.spinning ? 'Rolling...' : 'Roll'}
            </Button>
            <CashOutButton
              onCashOut={() => store.cashOutCredits()}
              disabled={store.spinning}
            />
          </>
        )}
      </Stack>

      <Typography variant="caption">
        C = Cherry (10) | L = Lemon (20) | O = Orange (30) | W = Watermelon (40)
      </Typography>
    </Box>
  );
});
