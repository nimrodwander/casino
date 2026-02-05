interface CreditDisplayProps {
  credits: number;
}

export function CreditDisplay({ credits }: CreditDisplayProps) {
  return (
    <div className="credit-display">
      <span className="credit-label">Credits:</span>
      <span className="credit-value">{credits}</span>
    </div>
  );
}
