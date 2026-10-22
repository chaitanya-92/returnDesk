"use client";
import { useEffect, useState } from "react";
type AnimatedNumberProps = { value: number; format?: (number: number) => string };

/** Animates a KPI value when its underlying number changes. */
export function AnimatedNumber({ value, format = (number: number) => Math.round(number).toLocaleString("en-IN") }: AnimatedNumberProps) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let frame = 0;
    let start: number | undefined;
    const duration = 700;
    const tick = (now: number) => {
      if (start === undefined) start = now;
      const progress = Math.min(1, (now - start) / duration);
      setShown(value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    setShown(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{format(shown)}</>;
}
