import React from 'react';
import { Container } from '@mui/material';
import { SlotMachine } from './components/SlotMachine';

export const App: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <SlotMachine />
    </Container>
  );
};
