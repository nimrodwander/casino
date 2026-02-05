import { useEffect, useState } from 'react';
import type { SlotSymbol } from '@casino/shared';
import { SYMBOL_NAMES } from '@casino/shared';

interface ReelProps {
  symbol: SlotSymbol | null;
  revealed: boolean;
  spinning: boolean;
}

const SPIN_CHARS = ['X', '*', '#', '+'];
const SPIN_INTERVAL_MS = 100;

export function Reel({ symbol, revealed, spinning }: ReelProps) {
  const [spinChar, setSpinChar] = useState('X');

  useEffect(() => {
    if (!spinning || revealed) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % SPIN_CHARS.length;
      setSpinChar(SPIN_CHARS[index]);
    }, SPIN_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [spinning, revealed]);

  const displayChar = revealed && symbol ? symbol : spinning ? spinChar : '-';
  const title = revealed && symbol ? SYMBOL_NAMES[symbol] : undefined;

  return (
    <div className="reel" title={title}>
      <span className={`reel-char ${spinning && !revealed ? 'spinning' : ''} ${revealed ? 'revealed' : ''}`}>
        {displayChar}
      </span>
    </div>
  );
}
