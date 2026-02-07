import React from 'react';
import { Stack } from '@mui/material';
import { Reel } from './Reel';
interface ReelStripProps {
  count: number;
  symbols: string[] | null;
  revealedCount: number;
  spinning: boolean;
}

export const ReelStrip: React.FC<ReelStripProps> = ({ count, symbols, revealedCount, spinning }) => {
  return (
    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
      {Array.from({ length: count }, (_, index) => (
        <Reel
          key={index}
          symbol={symbols ? symbols[index] : null}
          revealed={revealedCount > index}
          spinning={spinning}
        />
      ))}
    </Stack>
  );
};
