import type { Metadata } from "next";
import { ProjectCard } from "@/components/shared/project-card";
import { Reveal } from "@/components/motion/reveal";
import { projects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Machine learning, generative AI, and software projects by Md. Danial Dirar.",
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
            ML models, local-AI systems, and the software around them — most with
            source on GitHub.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={Math.min(i, 5) * 0.05}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
