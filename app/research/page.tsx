import type { Metadata } from "next";
import Image from "next/image";
import { PaperCard } from "@/components/research/paper-card";
import { Reveal } from "@/components/motion/reveal";
import { FieldMap } from "@/components/water/field-map";
import { PipelineGraph } from "@/components/ai/pipeline-graph";
import { ConferenceCard } from "@/components/research/conference-card";
import { research } from "@/lib/data/research";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Peer-reviewed research and ongoing work by Md. Danial Dirar — managed aquifer recharge, hydrology, machine learning for groundwater, and metagenomics.",
};

export default function ResearchPage() {
  const published = research.filter((p) => p.status === "published");
  const ongoing = research.filter((p) => p.status === "ongoing");

  return (
    <section className="relative pt-28 pb-20 md:pt-36">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade" />
      <div className="container-page">
        <Reveal>
          <h1 className="font-mono text-2xl font-semibold tracking-tight md:text-3xl">
            <span className="text-primary">$ </span>cat research/*.bib
          </h1>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-5 max-w-3xl text-muted-foreground">
            Peer-reviewed work on managed aquifer recharge and groundwater resilience in
            Bangladesh&apos;s Barind Tract, ongoing machine-learning research, and the
            local-AI bench that runs beside it.
          </p>
        </Reveal>

      </div>

      {/* The two benches, side by side and wider than the text column: the
          field sites on the left, the local-AI canvas (detailed) on the right. */}
      <div className="container-page mt-10 grid items-start gap-6 2xl:grid-cols-[400px_minmax(0,1fr)] 2xl:items-stretch">
          {/* Left column: the field sites, then the latest acceptance in
              the space the taller AI bench leaves below the map. From 2xl
              both columns end level; the pass takes up the difference. */}
          <div className="flex min-w-0 flex-col gap-6">
            <div className="min-w-0 rounded-xl border border-border/60 bg-card/40 p-5 md:p-7">
              <h2 className="font-mono text-sm text-muted-foreground">{"// where the field work is"}</h2>
              <FieldMap className="mt-5" />
            </div>
            <ConferenceCard className="flex-1" />
          </div>
          <div id="local-ai" className="flex min-w-0 scroll-mt-24 flex-col rounded-xl border border-border/60 bg-card/40 p-5 md:p-7">
            <h2 className="font-mono text-sm text-muted-foreground">{"// the local-AI bench"}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              Two pipelines that run on one local GPU: a private assistant built from
              open-weight LLMs, and ComfyUI for image and video. Run it, then inspect any
              node for what it does and where it runs.
            </p>
            <div className="mt-5">
              <PipelineGraph variant="detailed" />
            </div>

            {/* The real workspace behind the sketch. From 2xl it grows into
                whatever height the left column leaves, so the two columns
                end level without an empty band. */}
            <a
              href={asset("/ai/comfyui-workspace.webp")}
              target="_blank"
              rel="noreferrer"
              className="group mt-6 flex min-h-56 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/60 transition-colors hover:border-primary/40 2xl:min-h-40"
            >
              <span className="terminal-titlebar">
                <span className="terminal-dot bg-red-400/80" />
                <span className="terminal-dot bg-amber-400/80" />
                <span className="terminal-dot bg-emerald-400/80" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">ComfyUI, my workspace</span>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground group-hover:text-primary">
                  <span className="max-sm:hidden">open full size </span>↗
                </span>
              </span>
              <span className="relative block flex-1">
                <Image
                  src={asset("/ai/comfyui-workspace.webp")}
                  alt="A ComfyUI workspace with a video-generation workflow: loader, LoRA, sampling and decode groups wired together"
                  fill
                  sizes="(min-width: 1536px) 960px, 100vw"
                  className="object-cover object-[50%_35%] transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </span>
            </a>
          </div>
      </div>

      <div className="container-page">
        <div className="mt-14 space-y-10">
          {ongoing.length > 0 && (
            <div>
              <Reveal>
                <h2 className="mb-4 font-mono text-sm text-muted-foreground">
                  {"// in progress"}
                </h2>
              </Reveal>
              <div className="grid items-start gap-5 lg:grid-cols-2">
                {ongoing.map((paper, i) => (
                  <Reveal key={paper.id} delay={i * 0.06}>
                    <PaperCard paper={paper} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          <div>
            <Reveal>
              <h2 className="mb-4 font-mono text-sm text-muted-foreground">
                {"// published — peer reviewed"}
              </h2>
            </Reveal>
            <div className="grid items-start gap-5 lg:grid-cols-2">
              {published.map((paper, i) => (
                <Reveal key={paper.id} delay={i * 0.06}>
                  <PaperCard paper={paper} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
