import { useState, useEffect, useCallback, useRef } from 'react';

const REVEAL_INTERVAL_MS = 1000;

interface ReelRevealState {
  revealedCount: number;
  spinning: boolean;
}

export function useReelReveal<T>() {
  const [state, setState] = useState<ReelRevealState>({ revealedCount: 0, spinning: false });
  const onCompleteRef = useRef<((items: T[]) => void) | null>(null);
  const itemsRef = useRef<T[] | null>(null);

  useEffect(() => {
    if (!state.spinning || !itemsRef.current) return;

    const count = itemsRef.current.length;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 1; i <= count; i++) {
      timers.push(
        setTimeout(() => {
          setState((prev) => {
            const newCount = prev.revealedCount + 1;
            const done = newCount >= count;
            if (done) onCompleteRef.current?.(itemsRef.current!);
            return { revealedCount: newCount, spinning: !done };
          });
        }, i * REVEAL_INTERVAL_MS),
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [state.spinning]);

  const startReveal = useCallback((items: T[], onComplete: (items: T[]) => void) => {
    itemsRef.current = items;
    onCompleteRef.current = onComplete;
    setState({ revealedCount: 0, spinning: true });
  }, []);

  const resetReveal = useCallback(() => {
    itemsRef.current = null;
    onCompleteRef.current = null;
    setState({ revealedCount: 0, spinning: false });
  }, []);

  return { ...state, startReveal, resetReveal };
}
