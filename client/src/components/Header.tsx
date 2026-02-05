import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

export const Header: React.FC = () => (
  <AppBar position="static" color="transparent" elevation={0}>
    <Toolbar>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        Casino Jackpot
      </Typography>
    </Toolbar>
  </AppBar>
);
