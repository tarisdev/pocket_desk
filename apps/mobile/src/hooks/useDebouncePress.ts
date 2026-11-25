import { useCallback, useRef } from 'react';

export function useDebouncePress<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number = 500
): (...args: Args) => void {
  const lastCall = useRef(0);

  return useCallback(
    (...args: Args) => {
      const now = Date.now();
      if (now - lastCall.current < delayMs) {
        return;
      }
      lastCall.current = now;
      callback(...args);
    },
    [callback, delayMs]
  );
}
