import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TerminalHero } from "@/components/home/terminal-hero";
import { ProjectCard } from "@/components/shared/project-card";
import { PostCard } from "@/components/shared/post-card";
import { Reveal } from "@/components/motion/reveal";
import { FieldMap } from "@/components/water/field-map";
import { PipelineGraph } from "@/components/ai/pipeline-graph";
import { WaterBudget, type BudgetRow } from "@/components/water/water-budget";
import { featuredProjects, projects as allProjects } from "@/lib/data/projects";
import { research } from "@/lib/data/research";
import { getAllPosts } from "@/lib/blog";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

/**
 * The Barind water budget, from Hossain et al. (2026, 2025) in Applied Water
 * Science and the forecasting thesis. Bars use the paper's own proportions:
 * 27.10 of 50.61 Mm³ of runoff is rechargeable (53.5%).
 */
const WATER_BUDGET: BudgetRow[] = [
  { key: "runoff", value: "50.61 Mm³/yr", fill: 1, tone: "whole" },
  { key: "recharge", value: "27.10 Mm³/yr", fill: 27.1 / 50.61, tone: "part", note: "53.5%" },
  { key: "sites", value: "3,315", note: "MAR points on 377 km of canals and 257 acres of beels" },
  { key: "water table", value: "+2.01 m", note: "at the pilot system, 2015–2021" },
  { key: "forecast", value: "109 wells", note: "monthly, in the thesis" },
];

function SectionHeader({
  command,
  href,
  linkLabel,
  count,
}: {
  command: string;
  href: string;
  linkLabel: string;
  /** How many items wait behind the link; shown as a small tally. */
  count?: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <h2 className="font-mono text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
        <span className="text-primary">$ </span>
        {command}
      </h2>
      {/* A lit command chip rather than grey small print: a sheen passes over
          it now and then, and the arrow leans in on hover. */}
      <Link href={href} className="cta-chip group shrink-0">
        <span>{linkLabel}</span>
        {count !== undefined && (
          <span className="cta-count" aria-label={`${count} in total`}>
            {count}
          </span>
        )}
        <ArrowRight
          className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const projects = featuredProjects;
  const allPosts = getAllPosts();
  const posts = allPosts.slice(0, 3);

  return (
    <>
      <TerminalHero />

      {/* Two benches side by side: the water research on the left, the
          local-AI work on the right. Stacked on phones. */}
      <section className="border-y border-border/40 bg-card/30 py-16 md:py-20">
        <div className="container-page grid items-start gap-16 2xl:grid-cols-[400px_minmax(0,1fr)] 2xl:items-stretch 2xl:gap-10">
          <div className="min-w-0">
            <SectionHeader command="cat research/field.log" href="/research" linkLabel="research" count={research.length} />
            <p className="mt-5 leading-relaxed text-muted-foreground text-pretty">
              The Barind Tract irrigates almost all of its dry-season rice from groundwater,
              and its water table falls by up to 0.39 m a year. My research asks where that
              water can be put back, and how far ahead the wells can be forecast.
            </p>
            <FieldMap className="mt-8" />
            <div className="mt-8">
              <WaterBudget
                command="water-budget --tract barind"
                rows={WATER_BUDGET}
                source="Hossain et al., Applied Water Science 16 (2026) and 15 (2025)"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <SectionHeader command="comfy run local-ai.json" href="/research#local-ai" linkLabel="the bench" />
            <p className="mt-5 leading-relaxed text-muted-foreground text-pretty">
              The other bench: AI that runs on hardware you own. Open-weight LLMs, distilled
              and fine-tuned to fit one GPU and served offline, and ComfyUI pipelines for
              image and video with custom LoRAs. Press Run and watch it work.
            </p>
            <div className="mt-8">
              <PipelineGraph />
            </div>

            {/* The real thing behind the sketch above. From 2xl it sits at the
                foot of the column, its bottom edge level with the water
                budget's on the left; the caption moves above it for that. */}
            <figure className="mt-8 flex flex-col 2xl:mt-auto 2xl:pt-8">
              <figcaption className="order-first mb-2 font-mono text-[11px] text-muted-foreground">
                The sketch above, for real: a video workflow in my own ComfyUI.
              </figcaption>
              <a
                href={asset("/ai/comfyui-workspace.webp")}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-xl border border-border/60 bg-card/60 transition-colors hover:border-primary/40"
              >
                <span className="terminal-titlebar">
                  <span className="terminal-dot bg-red-400/80" />
                  <span className="terminal-dot bg-amber-400/80" />
                  <span className="terminal-dot bg-emerald-400/80" />
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    ComfyUI, my workspace
                  </span>
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground group-hover:text-primary">
                    open full size ↗
                  </span>
                </span>
                <Image
                  src={asset("/ai/comfyui-workspace.webp")}
                  alt="A ComfyUI workspace with a video-generation workflow: loader, LoRA, sampling and decode groups wired together, with a minimap in the corner"
                  width={1600}
                  height={875}
                  sizes="(min-width: 1536px) 936px, 100vw"
                  className="h-auto w-full"
                />
              </a>
            </figure>
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeader command="ls projects/ --featured" href="/projects" linkLabel="all projects" count={allProjects.length} />
          </Reveal>
          {/* Smaller cards, more of them: five across from 2xl (two full
              rows), four across with eight on laptops, two across on
              tablets, and the first six stacked on phones. */}
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
            {projects.map((project, i) => (
              <li
                key={project.slug}
                className={cn(i >= 6 && "max-sm:hidden", i >= 8 && "lg:max-2xl:hidden")}
              >
                <ProjectCard project={project} compact />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Latest posts */}
      {posts.length > 0 && (
        <section className="pb-20">
          <div className="container-page">
            <Reveal>
              <SectionHeader command="tail -n 3 blog.log" href="/blog" linkLabel="all posts" count={allPosts.length} />
            </Reveal>
            <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.slug} delay={i * 0.06}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
