import React from 'react';
import { Container, Box } from '@mui/material';
import { Header } from './components/Header';
import { SlotMachine } from './components/SlotMachine';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pb: 8,
        }}
      >
        <SlotMachine />
      </Container>
      <Footer />
    </Box>
  );
};
