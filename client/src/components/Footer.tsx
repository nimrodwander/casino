import { SYMBOLS } from '@casino/shared';
import { AppBar, Stack, Toolbar, Typography } from '@mui/material';
import React from 'react';

export const Footer: React.FC = () => (
  <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0 }}>
    <Toolbar variant="dense" sx={{ justifyContent: 'center' }}>
      <Stack direction="row" spacing={3}>
        {Object.entries(SYMBOLS).map(([symbol, reward]) => (
          <Stack key={symbol} direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {symbol[0].toUpperCase()}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {symbol.charAt(0).toUpperCase() + symbol.slice(1)}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              +{reward}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Toolbar>
  </AppBar>
);
