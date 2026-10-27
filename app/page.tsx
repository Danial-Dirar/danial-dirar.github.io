import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TerminalHero } from "@/components/home/terminal-hero";
import { ProjectCard } from "@/components/shared/project-card";
import { PostCard } from "@/components/shared/post-card";
import { Reveal } from "@/components/motion/reveal";
import { FieldMap } from "@/components/water/field-map";
import { FieldLog, type FieldFigure } from "@/components/water/field-log";
import { featuredProjects } from "@/lib/data/projects";
import { getAllPosts } from "@/lib/blog";

/** Pulled from the two Applied Water Science papers and the thesis. */
const FIELD_FIGURES: FieldFigure[] = [
  { value: 3315, label: "feasible MAR sites identified" },
  { value: 27.1, decimals: 1, unit: "M m³", label: "recharge potential a year" },
  { value: 2.01, decimals: 2, unit: "m", label: "water-table rise over seven years" },
  { value: 109, label: "wells in the forecasting thesis" },
];

function SectionHeader({
  command,
  href,
  linkLabel,
}: {
  command: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="font-mono text-xl font-semibold tracking-tight md:text-2xl">
        <span className="text-primary">$ </span>
        {command}
      </h2>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 font-mono text-[13px] text-muted-foreground transition-colors hover:text-primary"
      >
        {linkLabel}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const projects = featuredProjects.slice(0, 6);
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      <TerminalHero />

      {/* Field work — where the water research happens */}
      <section className="border-y border-border/40 bg-card/30 py-16 md:py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <SectionHeader command="cat research/field.log" href="/research" linkLabel="research" />
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground text-pretty">
              The Barind Tract in northwest Bangladesh irrigates almost all of its dry-season
              rice from groundwater, and its water table falls by up to 0.39 m a year. My
              research asks where that water can be put back — managed aquifer recharge
              through canals and reservoirs — and how far ahead the wells can be forecast.
            </p>
            <div className="mt-8 max-w-xl">
              <FieldLog command="grep -h result *.bib thesis/summary.txt" figures={FIELD_FIGURES} />
            </div>
          </div>
          <FieldMap />
        </div>
      </section>

      {/* Featured projects */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeader command="ls projects/ --featured" href="/projects" linkLabel="all projects" />
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest posts */}
      {posts.length > 0 && (
        <section className="pb-20">
          <div className="container-page">
            <Reveal>
              <SectionHeader command="tail -n 3 blog.log" href="/blog" linkLabel="all posts" />
            </Reveal>
            <div className="mt-8 grid gap-4">
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
