import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField } from '@mui/material';
import { slotMachineStore } from '../stores/SlotMachineStore';

export const StartGame: React.FC = () => {
  const navigate = useNavigate();

  const handleStartGame = async () => {
    await slotMachineStore.startGame();
    navigate('/play');
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <TextField
        placeholder="Enter your ID"
        variant="outlined"
        fullWidth
        sx={{ mb: 3, maxWidth: 400, mx: 'auto', backgroundColor: 'background.paper', borderRadius: 1, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
        slotProps={{ input: { style: { fontSize: '1.5rem', textAlign: 'center' } } }}
      />
      <Button variant="contained" size="large" onClick={handleStartGame}>
        Start Game
      </Button>
    </Box>
  );
};
