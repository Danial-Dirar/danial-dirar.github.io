"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProjectCard } from "@/components/shared/project-card";
import type { Project, ProjectCategory } from "@/lib/data/projects";
import { cn } from "@/lib/utils";

type Filter = "all" | "water" | ProjectCategory;

const CATEGORY_ORDER: ProjectCategory[] = ["AI", "ML", "Web", "Mobile", "Systems", "Graphics"];

const matches = (p: Project, f: Filter) =>
  f === "all" ? true : f === "water" ? Boolean(p.water) : p.category === f;

/** Filterable project grid. Cards glide to their new places when the filter changes. */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filters: Filter[] = [
    "all",
    ...CATEGORY_ORDER.filter((c) => projects.some((p) => p.category === c)),
    "water",
  ];
  const visible = projects.filter((p) => matches(p, filter));

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[13px]">
        <span className="text-muted-foreground">
          <span className="text-primary">$ </span>ls projects/ --type=
        </span>
        <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-1.5">
          {filters.map((f) => {
            const count = projects.filter((p) => matches(p, f)).length;
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md border px-2.5 py-1 transition-colors",
                  active
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:text-foreground",
                  f === "water" && !active && "hover:text-aquifer"
                )}
              >
                {f.toLowerCase()}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>

      <motion.ul layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, i) => (
            <motion.li
              key={project.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProjectCard project={project} priority={i < 3} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
