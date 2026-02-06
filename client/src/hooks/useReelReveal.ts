import { useState, useEffect, useCallback, useRef } from 'react';

export function useReelReveal<T>(intervalMs = 1000) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const itemsRef = useRef<T[]>([]);
  const onCompleteRef = useRef<((items: T[]) => void) | null>(null);

  useEffect(() => {
    if (!spinning) return;

    const total = itemsRef.current.length;
    const timers: NodeJS.Timeout[] = [];

    for (let i = 1; i <= total; i++) {
      timers.push(
        setTimeout(() => {
          setRevealedCount(i);
          if (i === total) {
            setSpinning(false);
            onCompleteRef.current?.(itemsRef.current);
          }
        }, i * intervalMs)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [spinning, intervalMs]);

  const startReveal = useCallback((items: T[], onComplete: (items: T[]) => void) => {
    itemsRef.current = items;
    onCompleteRef.current = onComplete;
    setRevealedCount(0);
    setSpinning(true);
  }, []);

  const resetReveal = useCallback(() => {
    itemsRef.current = [];
    onCompleteRef.current = null;
    setRevealedCount(0);
    setSpinning(false);
  }, []);

  return { revealedCount, spinning, startReveal, resetReveal };
}
