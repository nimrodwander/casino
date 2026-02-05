import React from 'react';
import { Box, Typography } from '@mui/material';

interface CreditDisplayProps {
  credits: number;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ credits }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography component="span" variant="h6" sx={{ mr: 1 }}>
        Credits:
      </Typography>
      <Typography component="span" variant="h5">
        {credits}
      </Typography>
    </Box>
  );
};
