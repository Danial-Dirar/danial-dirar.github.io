"use client";

import { useEffect, useRef } from "react";

/** How deep the bottom of the page reads, in metres below ground level. */
const MAX_DEPTH = 45;
/** Base of the Barind clay aquitard (21–39 m thick in the MAR study). */
const AQUIFER_TOP = 30;
const TICKS = [0, 10, 20, 30, 40];

/**
 * Scroll progress drawn as a borehole log: topsoil, the Barind clay aquitard,
 * then the aquifer, with a readout of how far down the page you are.
 *
 * The cursor rides a CSS scroll timeline where supported; the script only
 * writes the readout (and positions the cursor where scroll timelines are
 * missing). Nothing here re-renders React on scroll.
 */
export function DepthGauge() {
  const gauge = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const native = CSS.supports("animation-timeline", "scroll()");
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      const depth = p * MAX_DEPTH;
      if (readout.current) readout.current.textContent = `−${depth.toFixed(1)} m`;
      if (gauge.current) {
        gauge.current.dataset.zone = depth >= AQUIFER_TOP ? "aquifer" : "clay";
        if (!native) gauge.current.style.setProperty("--gauge-p", `${p * 100}%`);
      }
      if (!native && bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div ref={bar} className="scroll-bar xl:hidden" aria-hidden="true" />
      <div ref={gauge} className="gauge hidden xl:block" data-zone="clay" aria-hidden="true">
        <div className="gauge-ticks">
          {TICKS.map((m) => (
            <span key={m} className="gauge-tick" style={{ top: `${(m / MAX_DEPTH) * 100}%` }}>
              {m}
            </span>
          ))}
        </div>
        <div className="gauge-tube">
          <div className="gauge-cursor" />
        </div>
        <span ref={readout} className="gauge-readout">
          −0.0 m
        </span>
      </div>
    </>
  );
}
