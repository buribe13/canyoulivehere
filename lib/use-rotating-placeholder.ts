import { useState, useEffect, useRef } from "react";

export function useRotatingPlaceholder(
  starters: string[],
  intervalMs = 5000
): string {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (starters.length <= 1) return;

    const id = setInterval(() => {
      if (!pausedRef.current) {
        setIndex((prev) => (prev + 1) % starters.length);
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [starters.length, intervalMs]);

  return starters[index] ?? starters[0];
}
