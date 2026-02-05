import React from 'react';
import { Button } from '@mui/material';

interface CashOutButtonProps {
  onCashOut: () => void;
  disabled: boolean;
}

export const CashOutButton: React.FC<CashOutButtonProps> = ({ onCashOut, disabled }) => {
  return (
    <Button variant="contained" size="large" onClick={onCashOut} disabled={disabled}>
      Cash Out
    </Button>
  );
};
