import { Box, Typography } from '@mui/material';

interface CreditDisplayProps {
  credits: number;
}

export function CreditDisplay({ credits }: CreditDisplayProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography component="span" sx={{ color: 'text.secondary', mr: 1, fontSize: '1.3rem' }}>
        Credits:
      </Typography>
      <Typography component="span" sx={{ color: 'secondary.main', fontWeight: 'bold', fontSize: '1.5rem' }}>
        {credits}
      </Typography>
    </Box>
  );
}
