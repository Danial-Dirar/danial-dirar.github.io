"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  BANGLADESH_OUTLINE,
  BARIND_TRACT,
  FIELD_MAP_VIEWBOX,
  FIELD_SITES,
  RIVERS,
  type FieldSite,
} from "@/lib/data/field-map";
import { cn } from "@/lib/utils";

const [VB_W, VB_H] = FIELD_MAP_VIEWBOX.split(" ").slice(2).map(Number);
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

const FIELD = FIELD_SITES.filter((s) => s.kind === "field");

/** Godagari sits just below Mohanpur; its name goes underneath. */
const LABEL_BELOW = new Set(["godagari"]);

/** What the readout prints for each site. Keep to what the papers say. */
const SITE_NOTES: Record<string, { command: string; place: string; lines: string[] }> = {
  godagari: {
    command: "cat sites/godagari.txt",
    place: "Rajshahi",
    lines: [
      "Assessed for managed aquifer recharge (Applied Water Science, 2026)",
      "Temperature records behind the distributed-ML project",
    ],
  },
  mohanpur: {
    command: "cat sites/mohanpur.txt",
    place: "Rajshahi",
    lines: ["Assessed for managed aquifer recharge (Applied Water Science, 2026)"],
  },
  niamatpur: {
    command: "cat sites/niamatpur.txt",
    place: "Naogaon",
    lines: ["Assessed for managed aquifer recharge (Applied Water Science, 2026)"],
  },
  dhaka: {
    command: "cat ~/.location",
    place: "Dhaka",
    lines: ["Home, and BRAC University"],
  },
};

const coords = (s: FieldSite) => `${s.lat.toFixed(2)}°N  ${s.lon.toFixed(2)}°E  ${SITE_NOTES[s.id].place}`;

/** A survey crosshair, the GIS symbol for a located point. */
function Reticle() {
  return (
    <svg className="fm-reticle" viewBox="-9 -9 18 18" aria-hidden="true" focusable="false">
      <circle r="4.6" />
      <path d="M0 -8.6V-6.4M0 6.4V8.6M-8.6 0H-6.4M6.4 0H8.6" />
      <circle r="1.3" className="fm-reticle-core" />
    </svg>
  );
}

/**
 * Bangladesh with the Barind Tract, its three main rivers and the field sites
 * behind the MAR papers.
 *
 * It draws itself the first time it scrolls into view; then a terminal cursor
 * surveys the sites one by one — Godagari, Mohanpur, Niamatpur, then home —
 * locking a crosshair on each and laying the traverse between them. Hovering,
 * focusing or tapping a site prints its file in the readout underneath.
 * Without JavaScript, or with reduced motion, everything is simply in place.
 */
export function FieldMap({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const uid = useId().replace(/[^\w-]/g, "");
  const clipId = `fm-clip-${uid}`;
  const readoutId = `fm-readout-${uid}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    // Arm the hidden start state only now, so the map renders whole without JS.
    el.classList.add("fm-armed");

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    const survey = () => {
      const c = cursor.current;
      if (!c) return;
      const START = 1700; // once the coast and rivers are in
      const TRAVEL = 520;
      const DWELL = 380;
      let t = START;
      FIELD_SITES.forEach((site, i) => {
        const arrive = i === 0 ? 120 : TRAVEL;
        at(t, () => {
          c.style.left = pct(site.x, VB_W);
          c.style.top = pct(site.y, VB_H);
          c.dataset.on = "true";
          // Leg i of the traverse runs from field site i-1 to field site i.
          if (i > 0 && i < FIELD.length) el.querySelector(`[data-leg="${i}"]`)?.classList.add("is-drawn");
        });
        at(t + arrive, () => el.querySelector(`[data-site="${site.id}"]`)?.setAttribute("data-locked", ""));
        t += arrive + DWELL;
      });
      at(t + 300, () => delete c.dataset.on);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        el.classList.add("is-in");
        survey();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const current = FIELD_SITES.find((s) => s.id === active);
  const first = FIELD_SITES[0];

  return (
    <figure ref={ref} className={cn("field-map", className)}>
      <div className="relative mx-auto w-full max-w-[22rem]">
        <svg
          viewBox={FIELD_MAP_VIEWBOX}
          className="block h-auto w-full"
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

          {/* The survey traverse between the three Barind sites. */}
          {FIELD.slice(1).map((site, i) => (
            <line
              key={site.id}
              data-leg={i + 1}
              className="fm-leg"
              x1={FIELD[i].x}
              y1={FIELD[i].y}
              x2={site.x}
              y2={site.y}
              pathLength={1}
            />
          ))}
        </svg>

        <div className="fm-sites">
          {FIELD_SITES.map((site) => (
            <button
              key={site.id}
              type="button"
              data-site={site.id}
              data-kind={site.kind}
              data-label={LABEL_BELOW.has(site.id) ? "below" : "right"}
              data-active={active === site.id ? "" : undefined}
              className="fm-site"
              style={{ left: pct(site.x, VB_W), top: pct(site.y, VB_H) }}
              aria-label={`${site.label}: show details`}
              aria-controls={readoutId}
              // Plain bubbling over/out rather than enter/leave: enter/leave is
              // derived from relatedTarget, which synthetic pointers can omit.
              onMouseOver={() => setActive(site.id)}
              onMouseOut={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null);
              }}
              onFocus={() => setActive(site.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(site.id)}
            >
              {site.kind === "home" ? (
                <span className="fm-home" aria-hidden>
                  ~
                </span>
              ) : (
                <Reticle />
              )}
              <span
                className="fm-name"
                style={{ "--n": site.label.length } as React.CSSProperties}
                aria-hidden
              >
                {site.label.toLowerCase()}
              </span>
              {site.kind === "field" && (
                <span className="fm-drops" aria-hidden>
                  <i style={{ "--k": 0 } as React.CSSProperties} />
                  <i style={{ "--k": 1 } as React.CSSProperties} />
                  <i style={{ "--k": 2 } as React.CSSProperties} />
                </span>
              )}
            </button>
          ))}
          <span
            ref={cursor}
            className="fm-cursor"
            style={{ left: pct(first.x, VB_W), top: pct(first.y, VB_H) }}
            aria-hidden
          />
        </div>
      </div>

      <figcaption className="mx-auto mt-5 max-w-[22rem]">
        {/* Fixed height, sized for the longest file (Godagari): if the readout
            grew on hover it would shift the vertically centred map, pull the
            site out from under the pointer and flicker. */}
        <div id={readoutId} aria-live="polite" className="terminal-window">
          {/* Not .terminal-body: its unlayered md:text-sm would beat these sizes. */}
          <div className="h-[9.5rem] overflow-hidden px-4 py-3 font-mono text-[12px] leading-relaxed">
            {current ? (
              <>
                <p>
                  <span className="text-primary">$ </span>
                  {SITE_NOTES[current.id].command}
                </p>
                <p className="text-aquifer">{coords(current)}</p>
                {SITE_NOTES[current.id].lines.map((line) => (
                  <p key={line} className="text-muted-foreground">
                    {line}
                  </p>
                ))}
              </>
            ) : (
              <>
                <p>
                  <span className="text-primary">$ </span>ls sites/
                </p>
                <p className="text-muted-foreground">
                  {FIELD.map((s) => `${s.id}/`).join("  ")}  ~/
                </p>
                <p className="text-muted-foreground/60"># hover or tap a site to read its file</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 grid gap-1.5 font-mono text-[11px] leading-snug text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-4 shrink-0 rounded-sm border border-dashed border-clay bg-clay/30" aria-hidden />
            Barind Tract (approximate outline)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 shrink-0 rounded-full bg-aquifer" aria-hidden />
            Padma, Jamuna and Teesta, flowing to the Bay of Bengal
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
