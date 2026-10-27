"use client";

import { useId } from "react";
import { useTheme } from "@/components/theme/use-theme";
import { cn } from "@/lib/utils";

/**
 * The sun folds into a moon: a mask circle slides across the disc to bite a
 * crescent out of it while the rays retract. The icon is driven by the `.dark`
 * class on <html> (see globals.css), so it is right before any script runs.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  // useId output can contain characters that break inside url(#…).
  const maskId = `theme-bite-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <button
      type="button"
      aria-label={
        theme === "light" ? "Switch to dark theme" : theme === "dark" ? "Switch to light theme" : "Toggle theme"
      }
      onClick={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        toggle({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
      }}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-foreground/80 transition-colors hover:bg-accent/50 hover:text-foreground",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[1.1rem]" aria-hidden="true" focusable="false">
        <mask id={maskId}>
          <rect width="24" height="24" fill="#fff" />
          <circle className="toggle-bite" cx="25" cy="9" r="6.5" fill="#000" />
        </mask>
        <circle className="toggle-disc" cx="12" cy="12" r="5" mask={`url(#${maskId})`} />
        <g className="toggle-rays">
          <line x1="12" y1="1.6" x2="12" y2="4.2" />
          <line x1="12" y1="19.8" x2="12" y2="22.4" />
          <line x1="1.6" y1="12" x2="4.2" y2="12" />
          <line x1="19.8" y1="12" x2="22.4" y2="12" />
          <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" />
          <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" />
          <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" />
          <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" />
        </g>
      </svg>
    </button>
  );
}
