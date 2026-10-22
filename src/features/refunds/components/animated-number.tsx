"use client";

import { useEffect, useState } from "react";

export type AnimatedNumberProps = {
  value: number;
  duration?: number;
  format?: (value: number) => string;
};

/** Animates a KPI value when the underlying number changes. */
export function AnimatedNumber({
  value,
  duration = 700,
  format = (number) => Math.round(number).toLocaleString("en-IN"),
}: AnimatedNumberProps) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    let frame = 0;
    let start: number | undefined;

    const tick = (now: number) => {
      if (start === undefined) start = now;

      const progress = Math.min(1, (now - start) / duration);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setShown(value * easedProgress);

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{format(shown)}</>;
}
