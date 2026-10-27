"use client";

import { useEffect, useRef } from "react";

export type BudgetRow = {
  key: string;
  value: string;
  /** 0–1: draw a bar this full instead of a note. */
  fill?: number;
  /** The bar for the whole (dim) or the part recovered (bright). */
  tone?: "whole" | "part";
  /** Shown after a bar, or in place of one. */
  note?: string;
};

const CELLS = 20;

/**
 * The Barind water budget as a hydrologist would write it: what runs off,
 * how much of that recharge can put back, and what it amounts to on the
 * ground. Bars are terminal progress cells sized from the paper's own figures,
 * and they fill once, the first time the block scrolls into view. Without JS
 * or with reduced motion they are simply full.
 */
export function WaterBudget({
  command,
  rows,
  source,
}: {
  command: string;
  rows: BudgetRow[];
  source: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen
    el.classList.add("wb-armed");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="water-budget terminal-window">
      <div className="terminal-titlebar">
        <span className="terminal-dot bg-red-400/80" />
        <span className="terminal-dot bg-amber-400/80" />
        <span className="terminal-dot bg-emerald-400/80" />
      </div>
      <div className="px-4 py-4 font-mono text-[12.5px] leading-relaxed md:px-5">
        <p>
          <span className="text-primary">$ </span>
          {command}
        </p>
        <dl className="mt-3 grid grid-cols-[6.25rem_minmax(0,1fr)] gap-x-3 gap-y-2 sm:grid-cols-[6.25rem_7.5rem_minmax(0,1fr)]">
          {rows.map((row) => (
            <div key={row.key} className="contents">
              <dt className="text-muted-foreground">{row.key}</dt>
              <dd className="font-semibold text-aquifer tabular-nums">{row.value}</dd>
              <dd className="col-start-2 flex min-w-0 items-center gap-2.5 sm:col-start-3">
                {row.fill !== undefined ? (
                  <>
                    <span
                      className="wb-bar"
                      data-tone={row.tone ?? "whole"}
                      role="img"
                      aria-label={`${Math.round(row.fill * 100)}%`}
                    >
                      {Array.from({ length: CELLS }, (_, i) => (
                        <i
                          key={i}
                          data-on={i < Math.round(row.fill! * CELLS) ? "" : undefined}
                          style={{ "--c": i } as React.CSSProperties}
                        />
                      ))}
                    </span>
                    {row.note && <span className="shrink-0 text-muted-foreground">{row.note}</span>}
                  </>
                ) : (
                  <span className="text-muted-foreground">{row.note}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[11px] text-muted-foreground/70"># {source}</p>
      </div>
    </div>
  );
}
