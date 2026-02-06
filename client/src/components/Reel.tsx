import React from 'react';
import { Paper, Typography } from '@mui/material';
import type { SlotSymbol } from '@casino/shared';
import { SYMBOL_NAMES } from '@casino/shared';
import { useSpinAnimation } from '../hooks/useSpinAnimation';

interface ReelProps {
  symbol: SlotSymbol | null;
  revealed: boolean;
  spinning: boolean;
}

export const Reel: React.FC<ReelProps> = ({ symbol, revealed, spinning }) => {
  const spinChar = useSpinAnimation(spinning && !revealed, { spinChars: ['C', 'L', 'O', 'W'] });
  const displayChar = revealed && symbol ? symbol : spinning ? spinChar : '-';
  const title = revealed && symbol ? SYMBOL_NAMES[symbol] : undefined;

  return (
    <Paper
      title={title}
      sx={{
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h4">
        {displayChar}
      </Typography>
    </Paper>
  );
};
