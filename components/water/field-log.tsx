"use client";

import { useEffect, useRef } from "react";

export type FieldFigure = {
  value: number;
  decimals?: number;
  /** Printed after the number, e.g. "M m³". */
  unit?: string;
  label: string;
};

const format = (n: number, decimals = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Research figures printed like terminal output, counting up the first time
 * they scroll into view. The server renders the final values, so the numbers
 * are right without JavaScript and for anyone who prefers reduced motion.
 */
export function FieldLog({ command, figures }: { command: string; figures: FieldFigure[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = [...el.querySelectorAll<HTMLElement>("[data-count]")];
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen

    nodes.forEach((n) => (n.textContent = format(0, Number(n.dataset.decimals))));
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const DURATION = 1400;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          const eased = 1 - Math.pow(1 - t, 4);
          for (const n of nodes) {
            n.textContent = format(Number(n.dataset.count) * eased, Number(n.dataset.decimals));
          }
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="terminal-window">
      <div className="terminal-titlebar">
        <span className="terminal-dot bg-red-400/80" />
        <span className="terminal-dot bg-amber-400/80" />
        <span className="terminal-dot bg-emerald-400/80" />
      </div>
      <div className="terminal-body">
        <p>
          <span className="text-primary">$ </span>
          {command}
        </p>
        <dl className="mt-2 grid gap-y-1.5">
          {figures.map((f) => (
            // Each row is its own grid so the number can sit left of its label
            // while the label stays first in the source, as a <dt> should.
            <div key={f.label} className="grid grid-cols-[7.5rem_1fr] items-baseline gap-x-4">
              <dt className="order-2 text-muted-foreground">{f.label}</dt>
              <dd className="order-1 text-right font-semibold whitespace-nowrap text-aquifer tabular-nums">
                <span data-count={f.value} data-decimals={f.decimals ?? 0}>
                  {format(f.value, f.decimals)}
                </span>
                {f.unit ? <span className="font-normal">{` ${f.unit}`}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
