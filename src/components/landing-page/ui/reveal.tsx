"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/libs/utils";

function Reveal({
  className,
  delay,
  style,
  ...props
}: React.ComponentProps<"div"> & { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-slot="reveal"
      data-visible={isVisible}
      className={cn(
        isVisible && "animate-rise",
        !isVisible && "opacity-0",
        className,
      )}
      style={{
        ...style,
        animationDelay: delay !== undefined ? `${delay}ms` : undefined,
      }}
      {...props}
    />
  );
}

export { Reveal };
