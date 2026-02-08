import { SYMBOLS } from '@casino/shared';
import { Paper, Typography } from '@mui/material';
import React from 'react';
import { useSpinAnimation } from '../hooks/useSpinAnimation.hook';

interface ReelProps {
  symbol: string | null;
  revealed: boolean;
  spinning: boolean;
}

const spinChars = Object.keys(SYMBOLS).map((s) => s[0].toUpperCase());

export const Reel: React.FC<ReelProps> = ({ symbol, revealed, spinning }) => {
  const active = spinning && !revealed;
  const spinChar = useSpinAnimation(active, { spinChars });
  
  const getDisplayChar = (): string => {
    if (revealed && symbol) return symbol[0].toUpperCase();
    if (spinning) return spinChar;
    return '-';
  };

  const getTitle = (): string => {
    if (revealed && symbol) {
      return symbol.charAt(0).toUpperCase() + symbol.slice(1);
    }
    return '';
  };

  return (
    <Paper
      title={getTitle()}
      sx={{
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h4">
        {getDisplayChar()}
      </Typography>
    </Paper>
  );
};
