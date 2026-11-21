"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { asset } from "@/lib/asset";
import {
  ASSISTANT_ANSWER,
  CANVAS,
  EDGES,
  EXAMPLE_OUTPUTS,
  GROUPS,
  NODE,
  NODES,
  RUN_ORDER,
  nodeHeight,
  socketAt,
  type CanvasNode,
} from "@/lib/data/ai-pipeline";
import { cn } from "@/lib/utils";

const BY_ID = new Map(NODES.map((n) => [n.id, n]));
const STEP_MS = 380;
/** Phones keep text legible and pan sideways instead of shrinking further. */
const MIN_SCALE_NARROW = 0.7;
const MIN_SCALE = 0.45;
const MINIMAP_W = 168;

type Status = "idle" | "running" | "done";

const WIRES = EDGES.map((e) => {
  const from = BY_ID.get(e.from)!;
  const to = BY_ID.get(e.to)!;
  const a = socketAt(from, "out", e.out);
  const b = socketAt(to, "in", e.in);
  const dx = Math.max(48, (b.x - a.x) * 0.5);
  return {
    id: `${e.from}:${e.out}-${e.to}:${e.in}`,
    from: e.from,
    type: from.outputs![e.out].type,
    d: `M${a.x} ${a.y} C${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`,
  };
});

/**
 * The local-AI bench as a ComfyUI canvas: groups, typed sockets and wires
 * laid out at canvas coordinates, scaled to fit like ComfyUI's zoom (with a
 * zoom readout and a minimap). "Run" executes the graph column by column;
 * wires carry data once their source finishes and the outputs land last.
 *
 * The server renders the finished graph, so without JavaScript — or with
 * reduced motion — everything is simply there.
 */
export function PipelineGraph({ variant = "compact" }: { variant?: "compact" | "detailed" }) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const [scale, setScale] = useState<number | null>(null);
  const [scroll, setScroll] = useState({ left: 0, width: 1 });
  const [done, setDone] = useState(RUN_ORDER.length);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState(0);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const readoutId = `pg-readout-${useId().replace(/[^\w-]/g, "")}`;

  const queue = (advance: boolean) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (advance) setRun((r) => r + 1);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(RUN_ORDER.length);
      return;
    }
    setDone(0);
    setRunning(true);
    setElapsed(null);
    const start = performance.now();
    for (let k = 1; k <= RUN_ORDER.length; k++) {
      timers.current.push(window.setTimeout(() => setDone(k), k * STEP_MS));
    }
    timers.current.push(
      window.setTimeout(() => {
        setRunning(false);
        setElapsed((performance.now() - start) / 1000);
      }, RUN_ORDER.length * STEP_MS + 60),
    );
  };

  // Zoom to fit the available width, like ComfyUI's "fit view".
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const min = w < 640 ? MIN_SCALE_NARROW : MIN_SCALE;
      setScale(Math.min(1, Math.max(min, w / CANVAS.w)));
      setScroll({ left: el.scrollLeft, width: w });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Run once, the first time the canvas scrolls into view.
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

  const statusOf = (id: string): Status => {
    const i = RUN_ORDER.indexOf(id);
    return i < done ? "done" : running && i === done ? "running" : "idle";
  };
  const output = EXAMPLE_OUTPUTS[run % EXAMPLE_OUTPUTS.length];
  const current = active ? BY_ID.get(active) : undefined;
  const s = scale ?? 0.6;
  const mm = MINIMAP_W / CANVAS.w;
  const visible = scale ? Math.min(1, scroll.width / (CANVAS.w * scale)) : 1;
  const offset = scale ? scroll.left / (CANVAS.w * scale) : 0;

  return (
    <div ref={root} className="pipeline-graph">
      <div className="terminal-window">
        {/* ComfyUI-style top bar: the workflow tab, Run, status and zoom. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/60 bg-secondary/60 px-3 py-2">
          <span className="rounded-md border border-border/60 bg-background/60 px-2.5 py-1 font-mono text-[12px]">
            local-ai.json
          </span>
          <span role="status" className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {running
              ? `running ${Math.min(done + 1, RUN_ORDER.length)}/${RUN_ORDER.length}`
              : elapsed !== null
                ? `done in ${elapsed.toFixed(1)}s`
                : done === RUN_ORDER.length
                  ? "idle"
                  : "queued"}
          </span>
          <span className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 font-mono text-[11px] text-muted-foreground sm:inline-flex">
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
              <img src={asset("/logos/nvidia.svg")} alt="" width={14} height={14} className="size-3.5" />
              local GPU
            </span>
            <Button size="sm" className="rounded-md" onClick={() => queue(true)} disabled={running} aria-busy={running}>
              <Play className="size-3.5" aria-hidden />
              Run
            </Button>
          </span>
        </div>

        <div className="relative">
          <div
            ref={viewport}
            className={cn("pg-viewport", scale === null && "aspect-[1560/628]")}
            style={scale !== null ? { height: CANVAS.h * s } : undefined}
            onScroll={(e) => setScroll({ left: e.currentTarget.scrollLeft, width: e.currentTarget.clientWidth })}
            tabIndex={scale !== null && visible < 1 ? 0 : -1}
            aria-label="Pipeline canvas — scroll sideways to pan"
          >
            <div className="relative" style={{ width: CANVAS.w * s, height: CANVAS.h * s }}>
              <div
                className="pg-canvas absolute top-0 left-0 origin-top-left"
                style={{ width: CANVAS.w, height: CANVAS.h, transform: `scale(${s})` }}
              >
                {GROUPS.map((g) => (
                  <div
                    key={g.id}
                    className="pg-group"
                    data-tone={g.tone}
                    style={{ left: g.x, top: g.y, width: g.w, height: g.h }}
                  >
                    <span className="pg-group-title">{g.title}</span>
                  </div>
                ))}

                <svg className="pointer-events-none absolute inset-0" width={CANVAS.w} height={CANVAS.h} aria-hidden="true">
                  {WIRES.map((w) => (
                    <path
                      key={w.id}
                      d={w.d}
                      className={cn("pg-wire", statusOf(w.from) === "done" && "is-live")}
                      data-type={w.type}
                    />
                  ))}
                </svg>

                {NODES.map((node) => (
                  <GraphNode
                    key={node.id}
                    node={node}
                    status={statusOf(node.id)}
                    active={active === node.id}
                    readoutId={readoutId}
                    output={output}
                    onActivate={setActive}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Minimap, as in ComfyUI. Click to pan when the canvas overflows. */}
          <button
            type="button"
            className="pg-minimap"
            style={{ width: MINIMAP_W, height: CANVAS.h * mm }}
            aria-label="Minimap: jump to a part of the canvas"
            onClick={(e) => {
              const el = viewport.current;
              if (!el || !scale) return;
              const box = e.currentTarget.getBoundingClientRect();
              const f = (e.clientX - box.left) / box.width;
              el.scrollTo({ left: f * CANVAS.w * scale - el.clientWidth / 2, behavior: "smooth" });
            }}
          >
            {GROUPS.map((g) => (
              <span
                key={g.id}
                className="pg-mm-group"
                data-tone={g.tone}
                style={{ left: g.x * mm, top: g.y * mm, width: g.w * mm, height: g.h * mm }}
              />
            ))}
            {NODES.map((n) => (
              <span
                key={n.id}
                className="pg-mm-node"
                data-status={statusOf(n.id)}
                style={{ left: n.x * mm, top: n.y * mm, width: n.w * mm, height: nodeHeight(n) * mm }}
              />
            ))}
            <span className="pg-mm-view" style={{ left: `${offset * 100}%`, width: `${visible * 100}%` }} />
          </button>
          <span className="pg-zoom" aria-hidden>
            {Math.round(s * 100)}%
          </span>
        </div>
      </div>

      <p className="mt-2 font-mono text-[10.5px] text-muted-foreground/70">
        preview images: photos by{" "}
        <a href={output.href} target="_blank" rel="noreferrer" className="hover:text-primary">
          {output.credit}
        </a>{" "}
        on Unsplash
      </p>

      {/* Fixed height: a readout that grew on hover would move the page. */}
      <div
        id={readoutId}
        aria-live="polite"
        className="terminal-window mt-3 h-[6.75rem] overflow-hidden px-4 py-3 font-mono text-[12px] leading-relaxed"
      >
        {current ? (
          <>
            <p>
              <span className="text-primary">$ </span>comfy inspect {current.id}
            </p>
            <p className="text-muted-foreground">{current.note}</p>
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
              {NODES.length} nodes in {GROUPS.length} groups: {GROUPS.map((g) => g.title).join(", ")}
            </p>
            <p className="text-muted-foreground/60"># hover or tap a node to inspect it</p>
          </>
        )}
      </div>

      {variant === "detailed" && (
        <ol className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {NODES.map((n) => (
            <li key={n.id} className="text-sm leading-relaxed">
              <span className="font-mono text-[12px] text-primary">{n.title}</span>
              <span className="block text-muted-foreground">{n.note}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function GraphNode({
  node,
  status,
  active,
  readoutId,
  output,
  onActivate,
}: {
  node: CanvasNode;
  status: Status;
  active: boolean;
  readoutId: string;
  output: (typeof EXAMPLE_OUTPUTS)[number];
  onActivate: (id: string | null) => void;
}) {
  const io = Math.max(node.inputs?.length ?? 0, node.outputs?.length ?? 0);
  return (
    <button
      type="button"
      className="pg-node"
      data-status={status}
      data-active={active ? "" : undefined}
      style={{ left: node.x, top: node.y, width: node.w, height: nodeHeight(node) }}
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
      <span className="pg-title" style={{ height: NODE.title }}>
        <span className="pg-dot" aria-hidden />
        <span className="min-w-0 truncate">{node.title}</span>
        {node.logos && (
          <span className="ml-auto flex shrink-0 items-center gap-1" aria-hidden>
            {node.logos.map((logo) => (
              // eslint-disable-next-line @next/next/no-img-element -- tiny static logos
              <img key={logo.src} src={asset(logo.src)} alt="" width={15} height={15} className="size-[15px]" />
            ))}
          </span>
        )}
        <span className="pg-progress" aria-hidden />
      </span>

      <span className="block" style={{ padding: `${NODE.pad}px 10px` }}>
        {Array.from({ length: io }, (_, i) => {
          const inp = node.inputs?.[i];
          const out = node.outputs?.[i];
          return (
            <span key={i} className="pg-io" style={{ height: NODE.row }}>
              {inp && (
                <>
                  <span className="pg-socket pg-in" data-type={inp.type} aria-hidden />
                  <span className="text-muted-foreground">{inp.name}</span>
                </>
              )}
              {out && (
                <>
                  <span className="ml-auto text-muted-foreground">{out.name}</span>
                  <span className="pg-socket pg-out" data-type={out.type} aria-hidden />
                </>
              )}
            </span>
          );
        })}
        {node.widgets?.map((w) => (
          <span key={w.name} className="pg-widget-row" style={{ height: NODE.row }}>
            <span className="pg-widget">
              <span className="text-muted-foreground">{w.name}</span>
              <span className="truncate">{w.value}</span>
            </span>
          </span>
        ))}

        {node.result === "text" && (
          <span className={cn("pg-answer", status === "done" && "is-ready")}>
            {status === "done" ? ASSISTANT_ANSWER : "waiting for input…"}
          </span>
        )}
        {node.result === "image" && (
          <span className="pg-preview">
            {status === "done" ? (
              // eslint-disable-next-line @next/next/no-img-element -- fixed-size local preview
              <img key={output.src} src={asset(output.src)} alt={output.alt} width={720} height={720} className="pg-preview-img" />
            ) : (
              <span className="pg-preview-wait">{status === "running" ? "sampling…" : "waiting for input…"}</span>
            )}
          </span>
        )}
      </span>
    </button>
  );
}
