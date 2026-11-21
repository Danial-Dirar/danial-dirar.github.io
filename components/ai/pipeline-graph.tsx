"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { asset } from "@/lib/asset";
import {
  PIPELINE,
  PIPELINE_ANSWER,
  PIPELINE_OUTPUTS,
  type PipelineNode,
} from "@/lib/data/ai-pipeline";
import { cn } from "@/lib/utils";

/** Execution order: the two lanes step together, like two queued branches. */
const ORDER: string[] = PIPELINE[0].nodes.flatMap((n, i) => [n.id, PIPELINE[1].nodes[i]?.id].filter(Boolean) as string[]);
const NODES = new Map(PIPELINE.flatMap((l) => l.nodes).map((n) => [n.id, n]));
const EDGES = PIPELINE.flatMap((lane) =>
  lane.nodes.slice(1).map((to, i) => ({ from: lane.nodes[i], to })),
);
const STEP_MS = 420;
/** How far a wire bows out from its socket before curving back. */
const BOW = 34;

type Wire = { id: string; d: string; type: string; from: string; to: string };

/**
 * The local-AI bench as a ComfyUI-style graph. Nodes are real buttons laid out
 * by CSS (two lanes, one on phones); wires are measured from the sockets and
 * drawn behind them. "Queue Prompt" runs the graph: nodes execute in order,
 * wires carry data once their source is done, and the outputs land last.
 *
 * The server renders the finished graph, so without JavaScript — or with
 * reduced motion — everything, outputs included, is simply there.
 */
export function PipelineGraph({ variant = "compact" }: { variant?: "compact" | "detailed" }) {
  const root = useRef<HTMLDivElement>(null);
  const graph = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const [done, setDone] = useState(ORDER.length);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState(0);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const readoutId = `pg-readout-${useId().replace(/[^\w-]/g, "")}`;

  const queue = (advance: boolean) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (advance) setRun((r) => r + 1);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(ORDER.length);
      return;
    }
    setDone(0);
    setRunning(true);
    setElapsed(null);
    const start = performance.now();
    for (let k = 1; k <= ORDER.length; k++) {
      timers.current.push(window.setTimeout(() => setDone(k), k * STEP_MS));
    }
    timers.current.push(
      window.setTimeout(() => {
        setRunning(false);
        setElapsed((performance.now() - start) / 1000);
      }, ORDER.length * STEP_MS + 60),
    );
  };

  // Wires follow the sockets wherever the layout puts them.
  useEffect(() => {
    const el = graph.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const at = (sel: string) => {
        const r = el.querySelector(sel)?.getBoundingClientRect();
        return r ? { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top } : null;
      };
      const next: Wire[] = [];
      for (const { from, to } of EDGES) {
        const a = at(`[data-out="${from.id}"]`);
        const b = at(`[data-in="${to.id}"]`);
        if (!a || !b) continue;
        next.push({
          id: `${from.id}-${to.id}`,
          d: `M${a.x} ${a.y} C${a.x + BOW * 2} ${a.y}, ${b.x - BOW * 2} ${b.y}, ${b.x} ${b.y}`,
          type: from.output ?? "MODEL",
          from: from.id,
          to: to.id,
        });
      }
      setWires(next);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Run once, the first time the graph scrolls into view. Until then it
  // waits idle (only once we know it is off screen, so nothing flashes).
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (started.current) return;
        if (!entry.isIntersecting) {
          setDone(0);
          return;
        }
        started.current = true;
        io.disconnect();
        queue(false);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    const pending = timers.current;
    return () => {
      io.disconnect();
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const statusOf = (id: string) => {
    const i = ORDER.indexOf(id);
    return i < done ? "done" : running && i === done ? "running" : "idle";
  };
  const output = PIPELINE_OUTPUTS[run % PIPELINE_OUTPUTS.length];
  const current = active ? NODES.get(active) : undefined;
  const detailed = variant === "detailed";

  return (
    <div ref={root} className="pipeline-graph">
      <div className="terminal-window">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/60 bg-secondary/60 px-3 py-2">
          <Button size="sm" className="rounded-md" onClick={() => queue(true)} disabled={running} aria-busy={running}>
            <Play className="size-3.5" aria-hidden />
            Queue Prompt
          </Button>
          <span role="status" className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {running
              ? `running ${Math.min(done + 1, ORDER.length)}/${ORDER.length}`
              : elapsed !== null
                ? `done in ${elapsed.toFixed(1)}s`
                : done === ORDER.length
                  ? "ready"
                  : "queued"}
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
            <img src={asset("/logos/nvidia.svg")} alt="" width={14} height={14} className="size-3.5" />
            RTX 3090 · local
          </span>
        </div>

        <div ref={graph} className="pg-canvas relative grid gap-x-3 gap-y-8 p-3 sm:grid-cols-2 sm:p-4">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            {wires.map((w) => (
              <path
                key={w.id}
                d={w.d}
                className={cn("pg-wire", statusOf(w.from) === "done" && "is-live")}
                data-type={w.type}
              />
            ))}
          </svg>

          {PIPELINE.map((lane) => (
            <section key={lane.id} aria-label={lane.label} className="relative min-w-0">
              <p className="mb-3 font-mono text-[11px] text-muted-foreground">
                <span className="text-primary">#</span> {lane.label}
              </p>
              <ol className="flex flex-col gap-6 px-4">
                {lane.nodes.map((node) => (
                  <li key={node.id}>
                    <GraphNode
                      node={node}
                      status={statusOf(node.id)}
                      active={active === node.id}
                      detailed={detailed}
                      readoutId={readoutId}
                      output={output}
                      onActivate={setActive}
                    />
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>

      {/* Fixed height: a readout that grew on hover would move the graph. */}
      <div
        id={readoutId}
        aria-live="polite"
        className={cn(
          "terminal-window mt-4 overflow-hidden px-4 py-3 font-mono text-[12px] leading-relaxed",
          detailed ? "h-[9.5rem]" : "h-[8.75rem]",
        )}
      >
        {current ? (
          <>
            <p>
              <span className="text-primary">$ </span>comfy inspect {current.id}
            </p>
            {current.notes.map((n) => (
              <p key={n} className="text-muted-foreground">
                {n}
              </p>
            ))}
            {current.link && (
              <p className="mt-1">
                <Link href={current.link.href} className="text-primary hover:underline hover:underline-offset-4">
                  → {current.link.label}
                </Link>
              </p>
            )}
          </>
        ) : (
          <>
            <p>
              <span className="text-primary">$ </span>comfy ls
            </p>
            <p className="text-muted-foreground">
              {ORDER.length} nodes in 2 lanes: {PIPELINE.map((l) => l.label).join(", ")}
            </p>
            <p className="text-muted-foreground/60"># hover or tap a node to inspect it</p>
          </>
        )}
      </div>
    </div>
  );
}

function GraphNode({
  node,
  status,
  active,
  detailed,
  readoutId,
  output,
  onActivate,
}: {
  node: PipelineNode;
  status: "idle" | "running" | "done";
  active: boolean;
  detailed: boolean;
  readoutId: string;
  output: (typeof PIPELINE_OUTPUTS)[number];
  onActivate: (id: string | null) => void;
}) {
  const isOutput = !node.output;
  return (
    <button
      type="button"
      className="pg-node"
      data-status={status}
      data-active={active ? "" : undefined}
      aria-label={`${node.title}: inspect`}
      aria-controls={readoutId}
      onMouseOver={() => onActivate(node.id)}
      onMouseOut={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onActivate(null);
      }}
      onFocus={() => onActivate(node.id)}
      onBlur={() => onActivate(null)}
      onClick={() => onActivate(node.id)}
    >
      {node.input && <span className="pg-socket pg-in" data-in={node.id} data-type={node.input} aria-hidden />}
      {node.output && <span className="pg-socket pg-out" data-out={node.id} data-type={node.output} aria-hidden />}

      <span className="pg-title">
        <span className="pg-dot" aria-hidden />
        <span className="min-w-0 truncate">{node.title}</span>
        {node.logos && (
          <span className="ml-auto flex shrink-0 items-center gap-1" aria-hidden>
            {node.logos.map((logo) => (
              // eslint-disable-next-line @next/next/no-img-element -- tiny static logos
              <img key={logo.src} src={asset(logo.src)} alt="" width={14} height={14} className="size-3.5" />
            ))}
          </span>
        )}
        <span className="pg-progress" aria-hidden />
      </span>

      {node.widgets.length > 0 && (
        <span className="pg-body">
          {node.widgets.map((w) => (
            <span key={w.name} className="pg-widget">
              <span className="text-muted-foreground">{w.name}</span>
              <span className="truncate text-foreground/90">{w.value}</span>
            </span>
          ))}
          {detailed && <span className="pg-note">{node.notes[0]}</span>}
        </span>
      )}

      {isOutput && node.id === "answer" && (
        <span className="pg-body">
          <span className={cn("pg-answer", status === "done" ? "is-ready" : "")}>
            {status === "done" ? PIPELINE_ANSWER : "waiting for input…"}
          </span>
        </span>
      )}

      {isOutput && node.id === "save" && (
        <span className="pg-body">
          <span className="pg-preview">
            {status === "done" ? (
              // eslint-disable-next-line @next/next/no-img-element -- fixed-size local output
              <img key={output.src} src={asset(output.src)} alt={output.alt} width={640} height={640} className="pg-preview-img" />
            ) : (
              <span className="pg-preview-wait">{status === "running" ? "sampling…" : "waiting for input…"}</span>
            )}
          </span>
        </span>
      )}
    </button>
  );
}
