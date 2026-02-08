import { useState, useEffect } from 'react';

interface UseSpinAnimationOptions {
  spinChars?: string[];
  spinIntervalMs?: number;
}

export function useSpinAnimation(
  active: boolean,
  options: UseSpinAnimationOptions = {}
): string {
  const { spinChars = ['X'], spinIntervalMs = 100 } = options;
  const [spinChar, setSpinChar] = useState(spinChars[0]);

  useEffect(() => {
    if (!active) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % spinChars.length;
      setSpinChar(spinChars[index]);
    }, spinIntervalMs);

    return (): void => { clearInterval(interval); };
  }, [active, spinChars, spinIntervalMs]);

  return spinChar;
}
