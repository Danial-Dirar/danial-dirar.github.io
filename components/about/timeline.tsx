import type { TimelineEntry } from "@/lib/data/experience";

/**
 * A vertical timeline. The rail draws downward and each dot pops as it scrolls
 * in — pure CSS scroll timelines (globals.css), static where unsupported.
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
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
            <h3 className="font-medium leading-snug">{entry.title}</h3>
            <span className="font-mono text-xs text-muted-foreground">{entry.when}</span>
          </div>
          <p className="mt-0.5 font-mono text-[13px] text-primary/90">{entry.org}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {entry.detail}
          </p>
        </li>
      ))}
    </ol>
  );
}
