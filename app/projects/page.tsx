import type { Metadata } from "next";
import { ProjectGrid } from "@/components/projects/project-grid";
import { Reveal } from "@/components/motion/reveal";
import { projects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Machine learning, groundwater research, local AI and software projects by Md. Danial Dirar.",
};

export default function ProjectsPage() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade" />
      <div className="container-page">
        <Reveal>
          <h1 className="font-mono text-2xl font-semibold tracking-tight md:text-3xl">
            <span className="text-primary">$ </span>ls projects/
          </h1>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-5 max-w-xl text-muted-foreground">
            ML models, groundwater research, local-AI systems and the software around
            them — client sites included, most with source on GitHub.
          </p>
        </Reveal>

        <ProjectGrid projects={projects} />
      </div>
    </section>
  );
}
