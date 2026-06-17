"use client";

import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpenText,
  Code2,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Project, ProjectStatus } from "@/lib/projects";

function statusLabel(status: ProjectStatus) {
  if (status === "live") return "Live";
  if (status === "in-progress") return "In progress";
  if (status === "archived") return "Archived";
  return "Planned";
}

function linkItems(project: Project) {
  return [
    {
      label: "Open project",
      href: project.links.demo,
      icon: ExternalLink,
      accent: "text-foreground",
    },
    {
      label: "Code",
      href: project.links.github,
      icon: Code2,
      accent: "text-foreground",
    },
    {
      label: "Notes",
      href: project.links.writeup,
      icon: BookOpenText,
      accent: "text-foreground",
    },
    {
      label: "Video",
      href: project.links.video,
      icon: PlayCircle,
      accent: "text-foreground",
    },
  ].filter((item) => item.href);
}

export function ProjectModal({
  project,
  trigger,
  children,
}: {
  project: Project;
  trigger: ReactNode;
  children: ReactNode;
}) {
  const links = linkItems(project);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="glass max-h-[88vh] w-[calc(100vw-2rem)] max-w-2xl gap-0 overflow-y-auto border-border p-0">
        <div className="border-b border-border/50 p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="border border-border px-2 py-1">
              {statusLabel(project.status)}
            </span>
            {project.dateUpdated || project.dateCreated ? (
              <span className="border border-border px-2 py-1">
                {project.dateUpdated || project.dateCreated}
              </span>
            ) : null}
          </div>

          <DialogTitle className="headline-sm">
            {project.title}
          </DialogTitle>

          {(project.summary || project.description) && (
            <DialogDescription className="mt-3 text-sm leading-7 text-muted-foreground">
              {project.summary || project.description}
            </DialogDescription>
          )}

          {links.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 border border-border bg-background/50 p-3 transition-colors hover:border-foreground/30"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center border border-border bg-background ${link.accent}`}
                  >
                    <link.icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-medium text-foreground">
                      {link.label}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {link.href}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">{children}</div>

        <DialogClose className="sr-only">Close</DialogClose>
      </DialogContent>
    </Dialog>
  );
}
