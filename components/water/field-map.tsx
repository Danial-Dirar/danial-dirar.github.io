"use client";

import { useEffect, useId, useRef } from "react";
import {
  BANGLADESH_OUTLINE,
  BARIND_TRACT,
  FIELD_MAP_VIEWBOX,
  FIELD_SITES,
  RIVERS,
} from "@/lib/data/field-map";
import { cn } from "@/lib/utils";

/** Godagari and Mohanpur sit close together; one label goes underneath. */
const LABEL_BELOW = new Set(["godagari"]);

/**
 * Bangladesh with the Barind Tract, its three main rivers and the field sites
 * behind the MAR papers. Draws itself the first time it scrolls into view.
 */
export function FieldMap({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const uid = useId().replace(/[^\w-]/g, "");
  const clipId = `fm-clip-${uid}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    // Arm the hidden start state only now, so the map renders whole without JS.
    el.classList.add("fm-armed");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className={cn("field-map", className)}>
      <svg
        viewBox={FIELD_MAP_VIEWBOX}
        className="mx-auto block h-auto w-full max-w-[22rem]"
        role="img"
        aria-label="Map of Bangladesh showing the Barind Tract in the northwest, the Padma, Jamuna and Teesta rivers, and field sites at Godagari, Mohanpur and Niamatpur, with Dhaka marked as home."
      >
        <defs>
          <clipPath id={clipId}>
            <path d={BANGLADESH_OUTLINE} />
          </clipPath>
        </defs>

        <path className="fm-outline" d={BANGLADESH_OUTLINE} pathLength={1} />
        <path className="fm-barind" d={BARIND_TRACT} clipPath={`url(#${clipId})`} />

        {RIVERS.map((river, i) => (
          <g key={i}>
            <path className="fm-river" d={river.d} />
            <path className="fm-flow" d={river.d} pathLength={1} />
          </g>
        ))}

        {FIELD_SITES.map((site, i) => {
          const below = LABEL_BELOW.has(site.id);
          return (
            <g
              key={site.id}
              className="fm-pin"
              data-kind={site.kind}
              style={{ "--i": i } as React.CSSProperties}
            >
              <circle className="fm-ripple" cx={site.x} cy={site.y} r={6} style={{ "--r": i } as React.CSSProperties} />
              <circle
                className="fm-ripple"
                cx={site.x}
                cy={site.y}
                r={6}
                style={{ "--r": i + 1.5 } as React.CSSProperties}
              />
              <circle className="fm-pin-dot" cx={site.x} cy={site.y} r={4.5} />
              <text
                className="fm-label"
                x={below ? site.x : site.x + 9}
                y={below ? site.y + 18 : site.y + 4}
                textAnchor={below ? "middle" : "start"}
              >
                {site.label}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="mx-auto mt-5 grid max-w-[22rem] gap-1.5 font-mono text-[11px] leading-snug text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full bg-primary" aria-hidden />
          MAR study areas: Godagari, Mohanpur and Niamatpur
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-4 shrink-0 rounded-sm border border-dashed border-clay bg-clay/30" aria-hidden />
          Barind Tract (approximate outline)
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 shrink-0 rounded-full bg-aquifer" aria-hidden />
          Padma, Jamuna and Teesta, flowing to the Bay of Bengal
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full bg-brand-2" aria-hidden />
          Dhaka, home
        </span>
      </figcaption>
    </figure>
  );
}
