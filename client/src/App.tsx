import React from 'react';
import { Container } from '@mui/material';
import { SlotMachine } from './components/SlotMachine';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <>
      <Container maxWidth="sm" sx={{ py: 4, pb: 8 }}>
        <SlotMachine />
      </Container>
      <Footer />
    </>
  );
};
