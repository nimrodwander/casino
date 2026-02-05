import React from 'react';
import { Container, AppBar, Toolbar, Typography } from '@mui/material';
import { SlotMachine } from './components/SlotMachine';

export const App: React.FC = () => {
  return (
    <>
      <Container maxWidth="sm" sx={{ py: 4, pb: 8 }}>
        <SlotMachine />
      </Container>
      <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar variant="dense" sx={{ justifyContent: 'center' }}>
          <Typography variant="caption">
            C = Cherry (10) | L = Lemon (20) | O = Orange (30) | W = Watermelon (40)
          </Typography>
        </Toolbar>
      </AppBar>
    </>
  );
};
