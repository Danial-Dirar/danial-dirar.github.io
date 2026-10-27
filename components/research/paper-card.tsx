import { ArrowUpRight, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GitHubIcon } from "@/components/shared/icons";
import { ResultDiff } from "@/components/research/result-diff";
import { doiUrl, type ResearchPaper } from "@/lib/data/research";
import { cn } from "@/lib/utils";

export function PaperCard({ paper }: { paper: ResearchPaper }) {
  const ongoing = paper.status === "ongoing";

  return (
    <article className="overflow-hidden rounded-xl border border-border/60 bg-card/60 transition-colors hover:border-primary/40">
      <div className="p-5 md:p-6">
        {/* status + venue line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
              ongoing ? "bg-brand-2/15 text-brand-2" : "bg-primary/15 text-primary"
            )}
          >
            <FlaskConical className="size-3" />
            {ongoing ? "ongoing" : "published"}
          </span>
          <span>
            {paper.venue}
            {paper.volume ? ` · ${paper.volume}` : ""} · {paper.year}
          </span>
        </div>

        <h2 className="mt-3 font-heading text-lg font-semibold leading-snug tracking-tight md:text-xl">
          {paper.title}
        </h2>

        <p className="mt-2.5 text-sm text-muted-foreground">
          {paper.authors.map((a, i) => (
            <span key={a.name}>
              <span className={a.self ? "font-semibold text-foreground" : undefined}>
                {a.name}
              </span>
              {a.role ? (
                <span className="text-muted-foreground/70"> ({a.role})</span>
              ) : null}
              {i < paper.authors.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>

        {paper.changes && <ResultDiff changes={paper.changes} />}

        {/* abstract — always visible */}
        <p className="mt-5 border-t border-border/50 pt-4 text-sm leading-relaxed text-foreground/85">
          <span className="font-mono text-primary">abstract › </span>
          {paper.abstract}
        </p>

        {/* topics */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {paper.topics.map((t) => (
            <Badge key={t} variant="secondary" className="font-mono text-[11px]">
              {t}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          {paper.doi && (
            <a
              href={doiUrl(paper.doi)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              doi:{paper.doi}
              <ArrowUpRight className="size-3" />
            </a>
          )}
          {paper.repo && (
            <a
              href={paper.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              <GitHubIcon className="size-3" />
              code on github
              <ArrowUpRight className="size-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
