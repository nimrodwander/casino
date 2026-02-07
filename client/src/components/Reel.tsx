import React from 'react';
import { Paper, Typography } from '@mui/material';
import { SYMBOLS } from '@casino/shared';
import { useSpinAnimation } from '../hooks/useSpinAnimation';

interface ReelProps {
  symbol: string | null;
  revealed: boolean;
  spinning: boolean;
}

const spinChars = Object.keys(SYMBOLS).map((s) => s[0].toUpperCase());

export const Reel: React.FC<ReelProps> = ({ symbol, revealed, spinning }) => {
  const spinChar = useSpinAnimation(spinning && !revealed, { spinChars });
  const displayChar = revealed && symbol ? symbol[0].toUpperCase() : spinning ? spinChar : '-';
  const title = revealed && symbol ? symbol.charAt(0).toUpperCase() + symbol.slice(1) : undefined;

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
