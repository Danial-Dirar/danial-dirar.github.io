import Image from "next/image";
import { ArrowUpRight, Quote } from "lucide-react";
import { asset } from "@/lib/asset";
import { CITATIONS_AS_OF, doiUrl, type Journal, type OrgLogo } from "@/lib/data/research";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** A logo on a light tile: the marks keep their own colours on the dark card. */
export function LogoTile({ logo, className }: { logo: OrgLogo; className?: string }) {
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

/**
 * The way into a published paper and its standing, shared by /research and
 * /about: a clear DOI button, SCImago's own quartile strip, and the Google
 * Scholar citation count.
 */
export function PaperBadges({
  doi,
  journal,
  citations,
  className,
}: {
  doi?: string;
  journal?: Journal;
  citations?: number;
  className?: string;
}) {
  if (!doi && !journal && citations === undefined) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2 font-mono text-xs", className)}>
      {doi && (
        <a
          href={doiUrl(doi)}
          target="_blank"
          rel="noreferrer"
          className="group/doi inline-flex min-h-9 items-center gap-2 rounded-md border border-primary/45 bg-primary/10 px-3 py-1.5 text-primary transition-colors hover:border-primary hover:bg-primary/15"
        >
          <span className="font-semibold">read on {journal?.publisher.split(" ")[0] ?? "the journal"}</span>
          <span className="hidden text-primary/70 sm:inline">doi:{doi}</span>
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover/doi:-translate-y-0.5 group-hover/doi:translate-x-0.5"
            aria-hidden
          />
        </a>
      )}
      {journal && (
        <a
          href={journal.quartileUrl}
          target="_blank"
          rel="noreferrer"
          title={`${journal.quartile} journal: ${journal.quartileNote}`}
          className="inline-flex min-h-9 items-center gap-2 overflow-hidden rounded-md border border-[#9ccc65]/50 bg-white pr-2.5 transition-colors hover:border-[#9ccc65]"
        >
          <Image
            src={asset(journal.scimago.src)}
            alt={`SCImago: ${journal.quartile} in ${journal.quartileNote}`}
            width={journal.scimago.width}
            height={journal.scimago.height}
            className="h-9 w-auto"
          />
          <span className="font-semibold text-[#4b7a1e]">{journal.quartile}</span>
        </a>
      )}
      {citations !== undefined && (
        <a
          href={site.social.scholar}
          target="_blank"
          rel="noreferrer"
          title={`Google Scholar, ${CITATIONS_AS_OF}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border/70 px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Quote className="size-3.5 text-primary" aria-hidden />
          cited {citations}×
        </a>
      )}
    </div>
  );
}
