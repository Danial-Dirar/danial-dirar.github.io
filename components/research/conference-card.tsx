import Image from "next/image";
import { ArrowUpRight, CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { ResultDiff } from "@/components/research/result-diff";
import { asset } from "@/lib/asset";
import { latestConference as c } from "@/lib/data/conference";
import { cn } from "@/lib/utils";

/**
 * The latest conference acceptance as a conference pass: a stub with the
 * logos and the event, a perforation, then the paper. On a narrow column the
 * stub sits on top and the results fold away behind `cat abstract.txt`; when
 * the card is wide (container query, see `.pass` in globals.css) the stub
 * moves to the left, the perforation turns vertical and the results show.
 */
export function ConferenceCard({ className }: { className?: string }) {
  return (
    <article
      aria-labelledby="conference-heading"
      className={cn("pass relative flex flex-col rounded-xl border border-primary/30 bg-card/60", className)}
    >
      <div className="pass-grid flex-1">
        {/* ── stub ─────────────────────────────────────────── */}
        <div className="p-5 md:p-6">
          <ul className="pass-logo grid grid-cols-3 rounded-lg" aria-label="Conference, host and affiliation">
            {c.logos.map((logo) => (
              <li key={logo.src} className="h-16 p-2" title={logo.caption}>
                <Image
                  src={asset(logo.src)}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="size-full object-contain"
                />
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-start justify-between gap-3">
            <p className="pt-0.5 font-mono text-[11px] text-muted-foreground">
              {"// most recent conference paper"}
            </p>
            <span className="pass-stamp shrink-0 font-mono" aria-hidden>
              accepted
            </span>
          </div>

          <h2 id="conference-heading" className="mt-2 font-heading text-[16px] font-semibold leading-snug tracking-tight text-pretty">
            <span className="sr-only">Abstract accepted: </span>
            Accepted at the {c.conference}{" "}
            <span className="font-mono text-[13px] font-normal text-primary">({c.short})</span>
          </h2>

          <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary" aria-hidden />
              {c.dates}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" aria-hidden />
              {c.venue}
            </span>
          </p>
        </div>

        <div className="pass-perf" aria-hidden />

        {/* ── the paper ────────────────────────────────────── */}
        <div className="flex flex-col p-5 md:p-6">
          <h3 className="font-heading text-[15px] font-semibold leading-snug tracking-tight text-pretty">
            {c.title}
          </h3>
          <p className="pass-short mt-1.5 text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">{c.authors[0].name}</span> et al.
          </p>

          <details className="pass-more group mt-auto pt-3">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 font-mono text-[12px] [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-1 text-primary group-hover:underline">
                <span className="text-muted-foreground">$ </span>cat abstract.txt
                <ChevronRight
                  className="size-3.5 transition-transform duration-300 group-open:rotate-90"
                  aria-hidden
                />
              </span>
            </summary>
            <div className="pt-2">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {c.authors.map((a, i) => (
                  <span key={a.name}>
                    <span className={a.self ? "font-semibold text-foreground" : undefined}>{a.name}</span>
                    {i < c.authors.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground/80">{c.affiliations}</p>
              <p className="mt-2 font-mono text-[12px] text-muted-foreground text-pretty">
                <span className="text-primary">theme › </span>&ldquo;{c.theme}&rdquo;
              </p>
              <ResultDiff changes={c.changes} />
              <p className="mt-4 text-[13px] leading-relaxed text-foreground/85 text-pretty">
                <span className="font-mono text-primary">note › </span>
                {c.caveat}
              </p>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">{c.data}</p>
            </div>
          </details>

          <a
            href={c.url}
            target="_blank"
            rel="noreferrer"
            className="pass-link mt-2 inline-flex w-fit items-center gap-1 font-mono text-xs text-primary hover:underline"
          >
            icwfm2027.com
            <ArrowUpRight className="size-3" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}
