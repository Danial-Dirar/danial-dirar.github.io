import { ArrowUpRight, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GitHubIcon } from "@/components/shared/icons";
import { LogoTile, PaperBadges } from "@/components/research/paper-badges";
import { ResultDiff } from "@/components/research/result-diff";
import type { ResearchPaper } from "@/lib/data/research";
import { cn } from "@/lib/utils";

export function PaperCard({ paper }: { paper: ResearchPaper }) {
  const ongoing = paper.status === "ongoing";

  return (
    <article className="overflow-hidden rounded-xl border border-border/60 bg-card/60 transition-colors hover:border-primary/40">
      <div className="p-5 md:p-6">
        {/* status + venue line, publisher on the right */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
                ongoing ? "bg-brand-2/15 text-brand-2" : "bg-primary/15 text-primary"
              )}
            >
              <FlaskConical className="size-3" aria-hidden />
              {ongoing ? "ongoing" : "published"}
            </span>
            <span>
              {paper.venue}
              {paper.volume ? ` · ${paper.volume}` : ""} · {paper.year}
            </span>
          </div>
          {paper.journal && (
            <LogoTile logo={paper.journal.logo} className="h-7 w-32 shrink-0 px-2.5" />
          )}
        </div>

        <h2 className="mt-3 font-heading text-lg font-semibold leading-snug tracking-tight text-pretty md:text-xl">
          {paper.title}
        </h2>

        <p className="mt-2.5 text-sm text-muted-foreground">
          {paper.authors.map((a, i) => (
            <span key={a.name}>
              <span className={a.self ? "font-semibold text-foreground" : undefined}>{a.name}</span>
              {a.role ? <span className="text-muted-foreground/70"> ({a.role})</span> : null}
              {i < paper.authors.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>

        {/* Published: the way in, the journal's standing, and who cites it. */}
        <PaperBadges doi={paper.doi} journal={paper.journal} citations={paper.citations} className="mt-4" />

        {/* Ongoing: where the work happens and whose data it stands on. */}
        {paper.logos && (
          <div className="mt-4">
            <p className="font-mono text-[11px] text-muted-foreground">{paper.logos.label}</p>
            <ul className="mt-2 flex flex-wrap gap-2" aria-label={paper.logos.label}>
              {paper.logos.items.map((logo) => (
                <li key={logo.src}>
                  <LogoTile logo={logo} className="h-14 w-20" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {paper.changes && <ResultDiff changes={paper.changes} />}

        {/* The abstract folds to three lines; the whole text stays in the page. */}
        <details className="group mt-5 border-t border-border/50 pt-4">
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="text-sm leading-relaxed text-foreground/85 line-clamp-3 group-open:line-clamp-none">
              <span className="font-mono text-primary">abstract › </span>
              {paper.abstract}
            </span>
            <span className="mt-1.5 inline-block font-mono text-xs text-primary hover:underline">
              <span className="group-open:hidden">read full abstract</span>
              <span className="hidden group-open:inline">show less</span>
            </span>
          </summary>
        </details>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {paper.topics.map((t) => (
            <Badge key={t} variant="secondary" className="font-mono text-[11px]">
              {t}
            </Badge>
          ))}
          {paper.repo && (
            <a
              href={paper.repo}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              <GitHubIcon className="size-3" />
              code on github
              <ArrowUpRight className="size-3" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
