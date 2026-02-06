import { ALL_SYMBOLS, SYMBOL_NAMES, SYMBOL_REWARDS } from '@casino/shared';
import { AppBar, Stack, Toolbar, Typography } from '@mui/material';
import React from 'react';

export const Footer: React.FC = () => (
  <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0 }}>
    <Toolbar variant="dense" sx={{ justifyContent: 'center' }}>
      <Stack direction="row" spacing={3}>
        {ALL_SYMBOLS.map((symbol) => (
          <Stack key={symbol} direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {symbol}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {SYMBOL_NAMES[symbol]}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              +{SYMBOL_REWARDS[symbol]}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Toolbar>
  </AppBar>
);
