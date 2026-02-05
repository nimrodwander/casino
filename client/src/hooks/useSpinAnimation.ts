import { useState, useEffect } from 'react';

const SPIN_CHARS = ['X', '*', '#', '+'];
const SPIN_INTERVAL_MS = 100;

export function useSpinAnimation(active: boolean): string {
  const [spinChar, setSpinChar] = useState(SPIN_CHARS[0]);

  useEffect(() => {
    if (!active) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % SPIN_CHARS.length;
      setSpinChar(SPIN_CHARS[index]);
    }, SPIN_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [active]);

  return spinChar;
}
