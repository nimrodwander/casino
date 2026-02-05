interface CashOutButtonProps {
  onCashOut: () => void;
  disabled: boolean;
}

export function CashOutButton({ onCashOut, disabled }: CashOutButtonProps) {
  return (
    <button
      className="btn btn-cashout"
      onClick={onCashOut}
      disabled={disabled}
    >
      Cash Out
    </button>
  );
}
