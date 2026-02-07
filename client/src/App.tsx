import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { Header } from './components/Header';
import { StartGame } from './components/StartGame';
import { Game } from './components/Game';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
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
          <Routes>
            <Route path="/" element={<StartGame />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </Container>
        <Footer />
      </Box>
    </BrowserRouter>
  );
};
