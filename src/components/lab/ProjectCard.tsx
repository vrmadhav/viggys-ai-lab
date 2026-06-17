"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { CalendarDays, Star } from "lucide-react";
import type { Project, ProjectStatus } from "@/lib/projects";
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

export function ProjectCard({
  project,
  children,
}: {
  project: Project;
  children: ReactNode;
}) {
  const trigger = (
    <button
      type="button"
      id={`project-${project.slug}`}
      className="group flex min-h-96 scroll-mt-24 cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/50 text-left transition-colors hover:border-foreground/30 hover:bg-background/80"
    >
      <div className="relative h-44 border-b border-border/70 bg-muted/40">
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 330px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,var(--cyan-glow),transparent_36%),radial-gradient(circle_at_75%_75%,var(--violet-glow),transparent_42%)] opacity-55" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/10" />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-white/15 bg-background/55 px-2 py-1 backdrop-blur-md">
            {statusLabel(project.status)}
          </span>
          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--cyan-glow)]/40 bg-background/55 px-2 py-1 text-[var(--cyan-glow)] backdrop-blur-md">
              <Star className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-xl font-semibold tracking-normal text-foreground">
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
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{formatDate(project.dateUpdated || project.dateCreated)}</span>
          <span className="ml-auto transition-transform group-hover:translate-x-0.5">
            Preview →
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
