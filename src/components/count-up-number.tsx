"use client";

import { useEffect, useRef, useState } from "react";

type CountUpNumberProps = {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

export function CountUpNumber({
  value,
  suffix = "",
  duration = 1200,
  className,
}: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimatedRef.current) {
          return;
        }

        hasAnimatedRef.current = true;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setDisplayValue(value);
          observer.disconnect();
          return;
        }

        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);

          setDisplayValue(Math.round(value * easedProgress));

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            observer.disconnect();
          }
        };

        requestAnimationFrame(animate);
      },
      {
        rootMargin: "0px 0px 80% 0px",
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [duration, value]);

  return (
    <span ref={ref} className={className} aria-label={`${value}${suffix}`}>
      {displayValue}
      {suffix}
    </span>
  );
}
