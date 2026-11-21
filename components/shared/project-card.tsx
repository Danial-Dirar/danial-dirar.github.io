"use client";

import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Droplet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GitHubIcon } from "@/components/shared/icons";
import { asset } from "@/lib/asset";
import type { Project } from "@/lib/data/projects";
import { cn } from "@/lib/utils";
import { coverTransitionName } from "@/lib/view-transitions";

/**
 * `compact` is the smaller card for dense grids (the home page's five
 * across): tighter padding, a two-line summary and three stack badges.
 */
export function ProjectCard({
  project,
  priority,
  compact,
}: {
  project: Project;
  priority?: boolean;
  compact?: boolean;
}) {
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
            sizes={
              compact
                ? "(min-width: 1536px) 270px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                : "(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw"
            }
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

      <div className={cn("flex flex-1 flex-col", compact ? "p-4" : "p-5")}>
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className={cn(
              "font-heading leading-snug font-semibold tracking-tight",
              compact ? "text-[15px]" : "text-base"
            )}
          >
            <Link href={`/projects/${project.slug}`} className="hover:text-primary">
              {/* stretch the whole card into the link */}
              <span className="absolute inset-0" aria-hidden />
              {project.title}
            </Link>
          </h3>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{project.year}</span>
        </div>

        <p
          className={cn(
            "mt-2 flex-1 leading-relaxed text-muted-foreground",
            compact ? "line-clamp-2 text-[13px]" : "line-clamp-3 text-sm"
          )}
        >
          {project.summary}
        </p>

        <div className={cn("flex flex-wrap gap-1.5", compact ? "mt-3" : "mt-4")}>
          {project.stack.slice(0, compact ? 3 : 4).map((tech) => (
            <Badge key={tech} variant="secondary" className="font-mono text-[11px]">
              {tech}
            </Badge>
          ))}
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground",
            compact ? "mt-3" : "mt-4"
          )}
        >
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
