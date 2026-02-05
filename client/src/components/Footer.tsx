import React from 'react';
import { AppBar, Toolbar, Stack, Typography } from '@mui/material';
import { ALL_SYMBOLS, SYMBOL_NAMES, SYMBOL_REWARDS } from '@casino/shared';

export const Footer: React.FC = () => (
  <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0 }}>
    <Toolbar variant="dense" sx={{ justifyContent: 'center' }}>
      <Stack direction="row" spacing={3}>
        {ALL_SYMBOLS.map((s) => (
          <Stack key={s} direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {s}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {SYMBOL_NAMES[s]}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              +{SYMBOL_REWARDS[s]}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Toolbar>
  </AppBar>
);
