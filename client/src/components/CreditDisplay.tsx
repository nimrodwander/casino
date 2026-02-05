import React from 'react';
import { Chip } from '@mui/material';

interface CreditDisplayProps {
  credits: number;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ credits }) => {
  return (
    <Chip
      label={`Credits ${credits}`}
      sx={{
        bgcolor: '#1e3a5f',
        color: 'secondary.main',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        px: 1,
      }}
    />
  );
};
