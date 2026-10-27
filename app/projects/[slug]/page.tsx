import type { Metadata } from "next";
import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Droplet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/shared/icons";
import { asset } from "@/lib/asset";
import { getAdjacentProjects, getProject, projects } from "@/lib/data/projects";
import { coverTransitionName } from "@/lib/view-transitions";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { images: [project.image.src] },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { previous, next } = getAdjacentProjects(slug);

  return (
    <article className="relative pt-28 pb-20 md:pt-36">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade" />
      <div className="container-page max-w-4xl">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 font-mono text-[13px] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5" />
          cd ../projects
        </Link>

        <header className="mt-6">
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-primary">$ </span>cat projects/{project.slug}/README.md
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {project.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[13px] text-muted-foreground">
            <span>{project.year}</span>
            <span>{project.category.toLowerCase()}</span>
            {project.client && <span>built for {project.client}</span>}
            {project.water && (
              <span className="inline-flex items-center gap-1 text-aquifer">
                <Droplet className="size-3.5" aria-hidden />
                water &amp; climate
              </span>
            )}
          </div>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {project.summary}
          </p>
          {(project.repo || project.liveUrl) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.liveUrl && (
                <Button asChild className="rounded-full">
                  <a href={project.liveUrl} target="_blank" rel="noreferrer">
                    Open the live site
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              )}
              {project.repo && (
                <Button asChild variant="outline" className="rounded-full">
                  <a href={project.repo} target="_blank" rel="noreferrer">
                    <GitHubIcon className="size-4" />
                    View the source
                  </a>
                </Button>
              )}
            </div>
          )}
        </header>

        <figure className="mt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/60">
            <ViewTransition name={coverTransitionName(project.slug)} share="morph">
              <Image
                src={asset(project.image.src)}
                alt={project.image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 896px, 100vw"
                placeholder="blur"
                blurDataURL={project.image.blur}
                className="object-cover"
                style={project.image.position ? { objectPosition: project.image.position } : undefined}
              />
            </ViewTransition>
          </div>
          {project.image.credit && (
            <figcaption className="mt-2 font-mono text-[11px] text-muted-foreground">
              <a
                href={project.image.credit.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                {project.image.credit.text}
              </a>
            </figcaption>
          )}
        </figure>

        {project.highlights && (
          <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {project.highlights.map((h) => (
              <div key={h.label} className="rounded-lg border border-border/60 bg-card/50 p-4">
                <dt className="sr-only">{h.label}</dt>
                <dd>
                  <span className="block font-heading text-xl font-bold text-primary">{h.value}</span>
                  <span className="mt-1 block text-xs leading-snug text-muted-foreground">{h.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div>
            <h2 className="font-mono text-lg font-semibold">
              <span className="text-primary">$ </span>less about.txt
            </h2>
            <p className="mt-4 leading-relaxed text-foreground/85 text-pretty">{project.description}</p>
            {project.credits && (
              <p className="mt-5 border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground">
                {project.credits}
              </p>
            )}
          </div>

          <aside className="space-y-6">
            <div>
              <h2 className="font-mono text-[13px] text-muted-foreground">stack</h2>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="font-mono text-[11px]">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-mono text-[13px] text-muted-foreground">tags</h2>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="font-mono text-[11px]">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {project.diagram && (
          <figure className="mt-12">
            <h2 className="font-mono text-lg font-semibold">
              <span className="text-primary">$ </span>open architecture.webp
            </h2>
            <div className="mt-5 overflow-hidden rounded-xl border border-border/60 bg-white">
              <Image
                src={asset(project.diagram.src)}
                alt={project.diagram.alt}
                width={project.diagram.width}
                height={project.diagram.height}
                sizes="(min-width: 1024px) 896px, 100vw"
                placeholder="blur"
                blurDataURL={project.diagram.blur}
                className="h-auto w-full"
              />
            </div>
          </figure>
        )}

        {project.institutions && (
          <section className="mt-12">
            <h2 className="font-mono text-[13px] text-muted-foreground">
              {project.institutions.label.toLowerCase()}
            </h2>
            <ul className="mt-4 flex flex-wrap items-center gap-3">
              {project.institutions.items.map((inst) => (
                <li key={inst.short}>
                  <a
                    href={inst.url}
                    target="_blank"
                    rel="noreferrer"
                    title={inst.name}
                    className="flex h-16 items-center rounded-lg border border-border/60 bg-white px-4 transition-colors hover:border-primary/50"
                  >
                    <Image
                      src={asset(inst.logo)}
                      alt={inst.name}
                      width={120}
                      height={48}
                      className="h-10 w-auto object-contain"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav
          aria-label="More projects"
          className="mt-16 grid gap-3 border-t border-border/50 pt-8 sm:grid-cols-2"
        >
          <Link
            href={`/projects/${previous.slug}`}
            className="group rounded-xl border border-border/60 p-4 transition-colors hover:border-primary/40"
          >
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              <ArrowLeft className="size-3" /> previous
            </span>
            <span className="mt-1 block font-heading font-semibold group-hover:text-primary">
              {previous.title}
            </span>
          </Link>
          <Link
            href={`/projects/${next.slug}`}
            className="group rounded-xl border border-border/60 p-4 text-right transition-colors hover:border-primary/40"
          >
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              next <ArrowRight className="size-3" />
            </span>
            <span className="mt-1 block font-heading font-semibold group-hover:text-primary">
              {next.title}
            </span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
