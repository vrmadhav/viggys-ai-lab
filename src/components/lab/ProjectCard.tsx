"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { Project, ProjectStatus } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { ProjectModal } from "./ProjectModal";

function statusLabel(status: ProjectStatus) {
  if (status === "live") return "Live";
  if (status === "in-progress") return "In progress";
  if (status === "archived") return "Archived";
  return "Planned";
}

function formatDate(date: string) {
  if (!date) return "Undated";

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Undated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function projectAccentClasses(slug: string) {
  if (slug.includes("ai-cost")) {
    return "project-accent-emerald hover:border-project-emerald/50 hover:ring-project-emerald/20";
  }

  if (slug.includes("artist")) {
    return "project-accent-blue hover:border-project-blue/50 hover:ring-project-blue/20";
  }

  if (slug.includes("chatgpt")) {
    return "project-accent-magenta hover:border-project-magenta/50 hover:ring-project-magenta/20";
  }

  if (slug.includes("claude")) {
    return "project-accent-orange hover:border-project-orange/50 hover:ring-project-orange/20";
  }

  return "project-accent-neutral hover:border-project-neutral/40 hover:ring-project-neutral/15";
}

export function ProjectCard({
  project,
  children,
  priority = false,
}: {
  project: Project;
  children: ReactNode;
  priority?: boolean;
}) {
  const accentClasses = projectAccentClasses(project.slug);

  const trigger = (
    <button
      type="button"
      id={`project-${project.slug}`}
      className={`interactive-card group flex min-h-[27rem] scroll-mt-24 cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-card text-left shadow-[var(--shadow-card)] ring-4 ring-transparent ${accentClasses}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            fill
            loading={priority ? "eager" : "lazy"}
            sizes="(min-width: 1280px) 330px, (min-width: 768px) 50vw, 100vw"
            className="media-soft-hover object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="border-0 bg-card/90 text-muted-foreground shadow-sm backdrop-blur-md">
            {statusLabel(project.status)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="font-display text-xl font-medium leading-tight tracking-normal text-foreground">
          {project.title}
        </h2>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
          {project.summary || project.description || "Project notes coming soon."}
        </p>

        {project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)] group-hover:bg-surface-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{formatDate(project.dateUpdated || project.dateCreated)}</span>
          <span className="ml-auto inline-flex items-center gap-1 font-medium transition-colors group-hover:text-foreground">
            Preview
            <ArrowRight className="hover-nudge-x h-3 w-3" />
          </span>
        </div>
      </div>
    </button>
  );

  return (
    <ProjectModal project={project} trigger={trigger}>
      {children}
    </ProjectModal>
  );
}
