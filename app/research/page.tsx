import type { Metadata } from "next";
import { PaperCard } from "@/components/research/paper-card";
import { Reveal } from "@/components/motion/reveal";
import { FieldMap } from "@/components/water/field-map";
import { PipelineGraph } from "@/components/ai/pipeline-graph";
import { research } from "@/lib/data/research";

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

        {/* The two benches, side by side: the field sites on the left, the
            local-AI pipeline (in its detailed form) on the right. */}
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="min-w-0 rounded-xl border border-border/60 bg-card/40 p-5 md:p-7">
            <h2 className="font-mono text-sm text-muted-foreground">{"// where the field work is"}</h2>
            <FieldMap className="mt-5" />
          </div>
          <div id="local-ai" className="min-w-0 scroll-mt-24 rounded-xl border border-border/60 bg-card/40 p-5 md:p-7">
            <h2 className="font-mono text-sm text-muted-foreground">{"// the local-AI bench"}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              Two pipelines that run on one local GPU: a private assistant built from
              open-weight LLMs, and ComfyUI for image and video. Queue it, then inspect any
              node for what it does and where it runs.
            </p>
            <div className="mt-5">
              <PipelineGraph variant="detailed" />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-8">
          {ongoing.length > 0 && (
            <div>
              <Reveal>
                <h2 className="mb-4 font-mono text-sm text-muted-foreground">
                  {"// in progress"}
                </h2>
              </Reveal>
              <div className="space-y-5">
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
            <div className="space-y-5">
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
