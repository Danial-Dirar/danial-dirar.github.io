import Image from "next/image";
import { ArrowUpRight, Award, FlaskConical, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GitHubIcon } from "@/components/shared/icons";
import { ResultDiff } from "@/components/research/result-diff";
import { asset } from "@/lib/asset";
import { CITATIONS_AS_OF, doiUrl, type OrgLogo, type ResearchPaper } from "@/lib/data/research";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** A logo on a light tile: the marks keep their own colours on the dark card. */
function LogoTile({ logo, className }: { logo: OrgLogo; className?: string }) {
  return (
    <span
      className={cn("flex items-center justify-center rounded-md bg-[oklch(0.975_0.006_95)] p-1.5", className)}
      title={logo.name}
    >
      <Image
        src={asset(logo.src)}
        alt={`${logo.name} logo`}
        width={logo.width}
        height={logo.height}
        className="h-auto max-h-full w-auto max-w-full object-contain"
      />
    </span>
  );
}

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
        {(paper.doi || paper.journal || paper.citations !== undefined) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
            {paper.doi && (
              <a
                href={doiUrl(paper.doi)}
                target="_blank"
                rel="noreferrer"
                className="group/doi inline-flex min-h-8 items-center gap-2 rounded-md border border-primary/45 bg-primary/10 px-3 py-1.5 text-primary transition-colors hover:border-primary hover:bg-primary/15"
              >
                <span className="font-semibold">read on {paper.journal?.publisher.split(" ")[0] ?? "the journal"}</span>
                <span className="hidden text-primary/70 sm:inline">doi:{paper.doi}</span>
                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover/doi:-translate-y-0.5 group-hover/doi:translate-x-0.5"
                  aria-hidden
                />
              </a>
            )}
            {paper.journal?.quartile && (
              <a
                href={paper.journal.quartileUrl}
                target="_blank"
                rel="noreferrer"
                title={paper.journal.quartileNote}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-amber-400/45 bg-amber-400/10 px-2.5 py-1.5 text-amber-300 transition-colors hover:border-amber-300"
              >
                <Award className="size-3.5" aria-hidden />
                {paper.journal.quartile} journal
              </a>
            )}
            {paper.citations !== undefined && (
              <a
                href={site.social.scholar}
                target="_blank"
                rel="noreferrer"
                title={`Google Scholar, ${CITATIONS_AS_OF}`}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border/70 px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Quote className="size-3.5 text-primary" aria-hidden />
                cited {paper.citations}×
              </a>
            )}
          </div>
        )}

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
