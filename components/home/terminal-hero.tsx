"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/shared/icons";
import { ContourField } from "@/components/water/contour-field";
import { founderPhoto } from "@/lib/data/founder";
import { asset } from "@/lib/asset";
import { site } from "@/lib/site";

/**
 * The terminal script the hero "types". Commands are typed character by
 * character; outputs print instantly on the next tick (like a real shell).
 */
const SCRIPT: { cmd: string; out: string[] }[] = [
  { cmd: "whoami", out: [`${site.fullName} — ${site.role}`] },
  {
    cmd: "cat focus.txt",
    out: [
      "Machine learning, generative AI, local AI for business",
      "Groundwater forecasting in the Barind Tract",
    ],
  },
  {
    cmd: "ls research/",
    out: ["mar-field-performance.pdf  mar-potential.pdf  thesis/"],
  },
  { cmd: "./contact --now", out: [`→ ${site.email}`] },
];

const TYPE_MS = 55;
const PAUSE_AFTER_CMD = 350;
const PAUSE_AFTER_OUT = 650;
/** Typing starts once the portrait and headline have landed. */
const START_DELAY = 1100;

type Line = { kind: "cmd" | "out"; text: string; done?: boolean };

/** The whole session, already printed: what the server renders. */
const TRANSCRIPT: Line[] = SCRIPT.flatMap((entry) => [
  { kind: "cmd" as const, text: entry.cmd, done: true },
  ...entry.out.map((text) => ({ kind: "out" as const, text, done: true })),
]);

function TerminalLines({ lines, finished }: { lines: Line[]; finished: boolean }) {
  return (
    <>
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {line.kind === "cmd" ? (
            <>
              <span className="text-primary">$ </span>
              <span>{line.text}</span>
              {!line.done && <span className="cursor-blink" aria-hidden />}
            </>
          ) : (
            <span className="text-muted-foreground">{line.text}</span>
          )}
        </div>
      ))}
      {finished && (
        <div>
          <span className="text-primary">$ </span>
          <span className="cursor-blink" aria-hidden />
        </div>
      )}
    </>
  );
}

/**
 * Starts from the finished transcript, so the terminal reads correctly without
 * JavaScript and for anyone who prefers reduced motion. Otherwise it clears on
 * mount — while the box is still hidden by its entrance delay — and types.
 */
function useTerminalScript() {
  const [lines, setLines] = useState<Line[]>(TRANSCRIPT);
  const [finished, setFinished] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let step = 0; // which script entry
    let char = 0; // typing position within the command

    const tick = () => {
      const entry = SCRIPT[step];
      if (!entry) {
        setFinished(true);
        return;
      }
      if (char <= entry.cmd.length) {
        const text = entry.cmd.slice(0, char);
        setLines((prev) => {
          const next = [...prev];
          if (
            next.length &&
            next[next.length - 1].kind === "cmd" &&
            !next[next.length - 1].done
          ) {
            next[next.length - 1] = { kind: "cmd", text };
          } else {
            next.push({ kind: "cmd", text });
          }
          return next;
        });
        char += 1;
        timer.current = setTimeout(
          tick,
          char > entry.cmd.length ? PAUSE_AFTER_CMD : TYPE_MS,
        );
      } else {
        // command finished — print output lines at once, move on
        setLines((prev) => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], done: true };
          for (const out of entry.out)
            next.push({ kind: "out", text: out, done: true });
          return next;
        });
        step += 1;
        char = 0;
        timer.current = setTimeout(tick, PAUSE_AFTER_OUT);
      }
    };

    timer.current = setTimeout(() => {
      setLines([]);
      setFinished(false);
      timer.current = setTimeout(tick, START_DELAY);
    }, 0);
    return () => clearTimeout(timer.current);
  }, []);

  return { lines, finished };
}

export function TerminalHero() {
  const { lines, finished } = useTerminalScript();

  return (
    <section className="relative isolate overflow-hidden pt-20 pb-14 md:pt-28 md:pb-20">
      <ContourField />

      <div className="container-page grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
        {/* One orchestrated entrance, in CSS so it runs from first paint and
            ends visible without JavaScript: the portrait fills from the bottom
            like a rising water level, then the words, then the terminal types. */}
        <figure className="hero-portrait terminal-window portrait-frame order-first lg:order-last">
          <div className="terminal-titlebar">
            <span className="terminal-dot bg-red-400/80" />
            <span className="terminal-dot bg-amber-400/80" />
            <span className="terminal-dot bg-emerald-400/80" />
            <span className="ml-2 truncate font-mono text-xs text-muted-foreground">
              feh ~/photos/danial.jpg
            </span>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/11] lg:aspect-[4/5]">
            <Image
              src={asset(founderPhoto.src)}
              alt={founderPhoto.alt}
              fill
              priority
              sizes="(min-width: 1024px) 336px, 100vw"
              placeholder="blur"
              blurDataURL={founderPhoto.blurDataURL}
              className="object-cover"
              style={{ objectPosition: "50% 42%" }}
            />
          </div>
          {/* Status bar under the photo: the two places people go next. */}
          <figcaption className="flex items-center justify-between gap-3 border-t border-border/60 bg-secondary/60 px-3 py-2.5 font-mono text-xs">
            <a
              href={site.social.scholar}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
            >
              <GraduationCap className="size-3.5" aria-hidden />
              Google Scholar
              <ArrowUpRight className="size-3" aria-hidden />
            </a>
            <Link
              href="/about"
              className="group inline-flex items-center gap-1.5 text-primary hover:underline hover:underline-offset-4"
            >
              more about me
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </figcaption>
        </figure>

        <div>
          <p
            className="hero-rise font-mono text-sm text-primary"
            style={{ "--d": "0.35s" } as React.CSSProperties}
          >
            ~/portfolio
          </p>
          <h1
            className="hero-rise mt-3 font-heading text-4xl font-bold tracking-tight text-balance md:text-6xl"
            style={{ "--d": "0.45s" } as React.CSSProperties}
          >
            {site.name}
          </h1>
          <p
            className="hero-rise mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty"
            style={{ "--d": "0.55s" } as React.CSSProperties}
          >
            I build machine-learning systems and private, local AI for
            businesses — and study the groundwater under Bangladesh&apos;s
            Barind Tract.
          </p>

          <div
            className="hero-rise mt-7 flex flex-wrap items-center gap-3"
            style={{ "--d": "0.65s" } as React.CSSProperties}
          >
            <Button asChild className="rounded-full">
              <Link href="/projects">View projects</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/research">Read the research</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="icon"
              className="size-8 rounded-full"
            >
              <a
                href={site.social.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <GitHubIcon className="size-4" />
              </a>
            </Button>
          </div>

          <div
            className="hero-rise mt-9"
            style={{ "--d": "0.8s" } as React.CSSProperties}
          >
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot bg-red-400/80" />
                <span className="terminal-dot bg-amber-400/80" />
                <span className="terminal-dot bg-emerald-400/80" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {site.handle}@haifa: ~
                </span>
              </div>
              {/* Two layers in one grid cell. The full transcript sits underneath,
                  invisible, so the box has its final height from the first frame
                  and typing never pushes the page down; it is also what screen
                  readers get. The typed layer on top is decoration. */}
              <div className="terminal-body grid text-left">
                <div className="col-start-1 row-start-1 opacity-0 select-none">
                  <TerminalLines lines={TRANSCRIPT} finished />
                </div>
                <div className="col-start-1 row-start-1" aria-hidden="true">
                  <TerminalLines lines={lines} finished={finished} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
