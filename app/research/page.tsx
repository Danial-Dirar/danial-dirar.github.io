import type { Metadata } from "next";
import { PaperCard } from "@/components/research/paper-card";
import { Reveal } from "@/components/motion/reveal";
import { FieldMap } from "@/components/water/field-map";
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
      <div className="container-page max-w-3xl">
        <Reveal>
          <h1 className="font-mono text-2xl font-semibold tracking-tight md:text-3xl">
            <span className="text-primary">$ </span>cat research/*.bib
          </h1>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-5 text-muted-foreground">
            Peer-reviewed work on managed aquifer recharge and groundwater
            resilience in Bangladesh&apos;s Barind Tract — plus ongoing machine-learning
            research. Click any paper to read its abstract.
          </p>
        </Reveal>

        <div className="mt-10 rounded-xl border border-border/60 bg-card/40 p-5 md:p-7">
          <h2 className="font-mono text-sm text-muted-foreground">{"// where the field work is"}</h2>
          <FieldMap className="mt-5" />
        </div>

        <div className="mt-10 space-y-8">
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
