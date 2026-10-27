"use client";

import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Droplet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GitHubIcon } from "@/components/shared/icons";
import { asset } from "@/lib/asset";
import type { Project } from "@/lib/data/projects";
import { coverTransitionName } from "@/lib/view-transitions";

export function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
  return (
    <article
      className="spotlight group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/60 transition-colors hover:border-primary/40"
      onPointerMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - box.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - box.top}px`);
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border/50">
        <ViewTransition name={coverTransitionName(project.slug)} share="morph">
          <Image
            src={asset(project.image.src)}
            alt={project.image.alt}
            fill
            sizes="(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw"
            placeholder="blur"
            blurDataURL={project.image.blur}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            style={project.image.position ? { objectPosition: project.image.position } : undefined}
          />
        </ViewTransition>
        {project.water && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 font-mono text-[11px] text-aquifer backdrop-blur">
            <Droplet className="size-3" aria-hidden />
            water
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading text-base leading-snug font-semibold tracking-tight">
            <Link href={`/projects/${project.slug}`} className="hover:text-primary">
              {/* stretch the whole card into the link */}
              <span className="absolute inset-0" aria-hidden />
              {project.title}
            </Link>
          </h3>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{project.year}</span>
        </div>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="secondary" className="font-mono text-[11px]">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span>{project.category.toLowerCase()}</span>
          {project.client && <span>client work</span>}
          {project.repo && (
            <span className="inline-flex items-center gap-1.5">
              <GitHubIcon className="size-3.5" /> source
            </span>
          )}
          {project.liveUrl && (
            <span className="inline-flex items-center gap-1 text-primary">
              <ArrowUpRight className="size-3.5" /> live
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
