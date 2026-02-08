import { DEFAULT_PLAYER_NAME } from '@casino/shared';
import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { gameStore } from '../stores/game.store';

export const StartGame: React.FC = () => {
  const navigate = useNavigate();

  const handleStartGame = async (): Promise<void> => {
    await gameStore.startGame(DEFAULT_PLAYER_NAME);
    navigate('/game');
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
        Welcome!
      </Typography>
      <Button variant="contained" size="large" onClick={handleStartGame}>
        Start Game
      </Button>
    </Box>
  );
};
