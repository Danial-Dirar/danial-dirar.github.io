"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, FolderOpen, GraduationCap, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from "@/components/shared/icons";
import { cn } from "@/lib/utils";
import { ContourField } from "@/components/water/contour-field";
import { founderPhoto } from "@/lib/data/founder";
import { asset } from "@/lib/asset";
import { site } from "@/lib/site";

/**
 * The terminal script the hero "types". Commands are typed character by
 * character; outputs print instantly on the next tick (like a real shell).
 */
// Every output line stays under ~38 characters so nothing wraps mid-word on
// a 360px phone, where the terminal fits about 39 at 12px.
const SCRIPT: { cmd: string; out: string[] }[] = [
  { cmd: "whoami", out: [site.fullName, `${site.role}, Dhaka`] },
  {
    cmd: "cat focus.txt",
    out: [
      "Machine learning and generative AI",
      "Local AI, tailored for business",
      "Groundwater forecasting, Barind",
    ],
  },
  { cmd: "ls research/", out: ["mar-2025.pdf  mar-2026.pdf  thesis/"] },
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
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section className="relative isolate overflow-hidden pt-20 pb-14 md:pt-28 md:pb-20">
      <ContourField />

      <div className="container-page grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        {/* One orchestrated entrance, in CSS so it runs from first paint and
            ends visible without JavaScript: a veil drains off the portrait
            behind a rising water line, then the words, then the terminal types.
            Only transform and opacity animate, so it stays smooth while the
            page is still loading and hydrating. */}
        <figure className="hero-portrait terminal-window order-first mx-auto w-full max-w-sm lg:order-last lg:max-w-none">
          <div className="terminal-titlebar">
            <span className="terminal-dot bg-red-400/80" />
            <span className="terminal-dot bg-amber-400/80" />
            <span className="terminal-dot bg-emerald-400/80" />
            <span className="ml-2 truncate font-mono text-xs text-muted-foreground">
              feh ~/photos/danial.jpg
            </span>
          </div>
          {/* The photo's own 3:4 ratio at every width, so phones never crop it.
              The blur sits behind the image rather than on it, so the sharp
              photo simply paints over it instead of swapping in. */}
          <div
            className="relative aspect-[3/4] overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url("${founderPhoto.blurDataURL}")` }}
          >
            <Image
              src={asset(founderPhoto.src)}
              alt={founderPhoto.alt}
              fill
              priority
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 384px, 100vw"
              className="object-cover"
            />
            <span className="portrait-veil" aria-hidden />
            <span className="portrait-waterline" aria-hidden />
          </div>
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
            className="hero-rise mt-7"
            style={{ "--d": "0.65s" } as React.CSSProperties}
          >
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <Button asChild size="lg" variant="outline" className="rounded-full px-3 text-[13px]">
                <a href={site.social.github} target="_blank" rel="noreferrer">
                  <GitHubIcon className="size-4" />
                  GitHub
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-3 text-[13px]">
                <a href={site.social.scholar} target="_blank" rel="noreferrer">
                  <GraduationCap className="size-4" />
                  Google Scholar
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-3 text-[13px]">
                <Link href="/projects">
                  <FolderOpen className="size-4" />
                  Projects
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-3 text-[13px]">
                <a href={site.social.linkedin} target="_blank" rel="noreferrer">
                  <LinkedInIcon className="size-4" />
                  LinkedIn
                </a>
              </Button>
              <Button
                size="lg"
                className="col-span-2 rounded-full px-3 text-[13px]"
                aria-expanded={contactOpen}
                aria-controls="hero-contact"
                onClick={() => setContactOpen((open) => !open)}
              >
                <Mail className="size-4" />
                Contact
                <ChevronDown
                  className={cn("size-3.5 transition-transform duration-300", contactOpen && "rotate-180")}
                />
              </Button>
            </div>

            {/* Opens in place, under the buttons — no popover to position or
                clip on a phone. Height animates through grid rows 0fr → 1fr. */}
            <div
              id="hero-contact"
              className="contact-drawer"
              data-open={contactOpen ? "" : undefined}
              inert={!contactOpen}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-2.5 pt-3">
                  <a href={`mailto:${site.email}`} className="contact-chip">
                    <Mail className="size-4 text-primary" aria-hidden />
                    {site.email}
                  </a>
                  <a href={site.whatsapp} target="_blank" rel="noreferrer" className="contact-chip">
                    <WhatsAppIcon className="size-4 text-primary" />
                    WhatsApp {site.phone}
                  </a>
                </div>
              </div>
            </div>
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
