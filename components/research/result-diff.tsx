import type { ResearchPaper } from "@/lib/data/research";
import { cn } from "@/lib/utils";

/**
 * A paper's results as a diff: "-" lines are the baseline it started from,
 * "+" lines what it found or achieved. Results in this field are changes —
 * turbidity down, recharge up — so a before/after reads truer than loose
 * headline numbers.
 */
export function ResultDiff({ changes }: { changes: NonNullable<ResearchPaper["changes"]> }) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-border/60 bg-background/50 font-mono text-[12.5px] leading-relaxed">
      <p className="border-b border-border/50 px-4 py-2 text-[11px]" aria-hidden>
        <span className="text-destructive/80">--- before</span>
        <span className="ml-4 text-primary">+++ after</span>
      </p>
      <ul className="py-1.5" aria-label="Results, before and after">
        {changes.map((c) => {
          const after = c.sign === "+";
          return (
            <li
              key={`${c.sign}${c.value}${c.label}`}
              // Phones: the label drops under its value instead of squeezing
              // into a narrow third column.
              className={cn(
                "grid grid-cols-[0.9rem_minmax(0,1fr)] items-baseline gap-x-2 px-4 py-1 sm:grid-cols-[0.9rem_6.75rem_minmax(0,1fr)] sm:py-0.5",
                after ? "bg-primary/[0.05]" : "bg-destructive/[0.06]"
              )}
            >
              <span aria-hidden className={after ? "text-primary" : "text-destructive/80"}>
                {c.sign}
              </span>
              <span className={cn("font-semibold tabular-nums", after ? "text-primary" : "text-destructive/90")}>
                <span className="sr-only">{after ? "After: " : "Before: "}</span>
                {c.value}
              </span>
              <span className="col-start-2 text-muted-foreground sm:col-start-3">{c.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
