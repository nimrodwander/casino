import { useState, useEffect, useCallback, useRef } from 'react';

const REVEAL_INTERVAL_MS = 1000;
const INITIAL_STATE = { revealedCount: 0, spinning: false };

type OnComplete<T> = (items: T[]) => void;

export function useReelReveal<T>() {
  const [state, setState] = useState(INITIAL_STATE);
  const itemsRef = useRef<T[]>([]);
  const onCompleteRef = useRef<OnComplete<T> | null>(null);

  const scheduleReveal = (revealed: number, total: number) =>
    setTimeout(() => {
      const done = revealed >= total;
      setState({ revealedCount: revealed, spinning: !done });
      if (done) onCompleteRef.current?.(itemsRef.current);
    }, revealed * REVEAL_INTERVAL_MS);

  useEffect(() => {
    if (!state.spinning) return;
    const total = itemsRef.current.length;
    const timers = Array.from({ length: total }, (_, i) => scheduleReveal(i + 1, total));
    return () => timers.forEach(clearTimeout);
  
  }, [state.spinning]);

  const startReveal = useCallback((items: T[], onComplete: OnComplete<T>) => {
    itemsRef.current = items;
    onCompleteRef.current = onComplete;
    setState({ revealedCount: 0, spinning: true });
  }, []);

  const resetReveal = useCallback(() => {
    itemsRef.current = [];
    onCompleteRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  return { ...state, startReveal, resetReveal };
}
