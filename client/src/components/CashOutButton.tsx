import { Button } from '@mui/material';

interface CashOutButtonProps {
  onCashOut: () => void;
  disabled: boolean;
}

export function CashOutButton({ onCashOut, disabled }: CashOutButtonProps) {
  return (
    <Button variant="contained" color="success" size="large" onClick={onCashOut} disabled={disabled}>
      Cash Out
    </Button>
  );
}
