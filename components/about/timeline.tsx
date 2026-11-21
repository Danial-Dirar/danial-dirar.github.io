import Image from "next/image";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "@/lib/data/experience";

/** "AFK Productions" → AFK, "Steam Store Bangladesh" → SSB. */
function monogram(org: string) {
  const words = org.split(/[\s,]+/).filter((w) => w && !/^(co\.?|ltd\.?|llc|limited|the|of|and)$/i.test(w));
  if (/^[A-Z0-9]{2,4}$/.test(words[0] ?? "")) return words[0];
  return words
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/**
 * A vertical timeline. The rail draws downward and each dot pops as it scrolls
 * in — pure CSS scroll timelines (globals.css), static where unsupported.
 * Each entry carries its organisation's mark, small, on a light tile.
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="timeline mt-6 space-y-7">
      {entries.map((entry) => (
        <li
          key={`${entry.org}-${entry.title}`}
          className="timeline-item"
          data-current={entry.current ? "true" : undefined}
        >
          <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3.5">
            {entry.logo ? (
              <span
                className={cn(
                  "flex h-11 w-14 items-center justify-center overflow-hidden rounded-md",
                  entry.logo.tile === "cover"
                    ? "ring-1 ring-border/60"
                    : entry.logo.tile === "dark"
                      ? "bg-black p-1.5 ring-1 ring-border/60"
                      : "bg-[oklch(0.975_0.006_95)] p-1"
                )}
              >
                <Image
                  src={asset(entry.logo.src)}
                  alt={`${entry.org} logo`}
                  width={entry.logo.width}
                  height={entry.logo.height}
                  className={
                    entry.logo.tile === "cover"
                      ? "size-full object-cover"
                      : "h-auto max-h-full w-auto max-w-full object-contain"
                  }
                />
              </span>
            ) : (
              <span
                className="flex h-11 w-14 items-center justify-center rounded-md border border-border/60 bg-muted/40 font-mono text-[11px] font-semibold tracking-wider text-muted-foreground"
                aria-hidden
              >
                {monogram(entry.org)}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <h3 className="font-medium leading-snug">{entry.title}</h3>
                <span className="font-mono text-xs text-muted-foreground">{entry.when}</span>
              </div>
              <p className="mt-0.5 font-mono text-[13px] text-primary/90">{entry.org}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {entry.detail}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
