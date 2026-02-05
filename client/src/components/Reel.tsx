import React, { useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import type { SlotSymbol } from '@casino/shared';
import { SYMBOL_NAMES } from '@casino/shared';

interface ReelProps {
  symbol: SlotSymbol | null;
  revealed: boolean;
  spinning: boolean;
}

const SPIN_CHARS = ['X', '*', '#', '+'];
const SPIN_INTERVAL_MS = 100;

export const Reel: React.FC<ReelProps> = ({ symbol, revealed, spinning }) => {
  const [spinChar, setSpinChar] = useState('X');

  useEffect(() => {
    if (!spinning || revealed) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % SPIN_CHARS.length;
      setSpinChar(SPIN_CHARS[index]);
    }, SPIN_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [spinning, revealed]);

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
        border: 1,
        borderColor: '#0f3460',
        borderRadius: 3,
      }}
    >
      <Typography
        sx={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          color: spinning && !revealed ? 'primary.main' : revealed ? 'secondary.main' : 'text.primary',
          '@keyframes pop': {
            '0%': { transform: 'scale(1.5)' },
            '100%': { transform: 'scale(1)' },
          },
          animation: revealed ? 'pop 0.3s ease-out' : undefined,
        }}
      >
        {displayChar}
      </Typography>
    </Paper>
  );
};
