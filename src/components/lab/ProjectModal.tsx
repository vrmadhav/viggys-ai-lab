"use client";

import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpenText,
  Code2,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    },
    {
      label: "Code",
      href: project.links.github,
      icon: Code2,
    },
    {
      label: "Notes",
      href: project.links.writeup,
      icon: BookOpenText,
    },
    {
      label: "Video",
      href: project.links.video,
      icon: PlayCircle,
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
      <DialogContent className="flex max-h-[88vh] w-[calc(100vw-2rem)] max-w-3xl flex-col gap-0 overflow-hidden border-border bg-background p-0">
        <div className="shrink-0 border-b border-border bg-card px-6 py-6 pr-16 sm:px-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {statusLabel(project.status)}
            </Badge>
            {project.dateUpdated || project.dateCreated ? (
              <Badge variant="outline" className="text-muted-foreground">
                {project.dateUpdated || project.dateCreated}
              </Badge>
            ) : null}
          </div>

          <DialogTitle className="font-display text-3xl font-medium leading-tight tracking-normal sm:text-4xl">
            {project.title}
          </DialogTitle>

          {(project.summary || project.description) && (
            <DialogDescription className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {project.summary || project.description}
            </DialogDescription>
          )}

          {links.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="interactive-control group flex items-center gap-3 rounded-2xl border border-border bg-background p-4 hover:border-foreground/20 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground">
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
                  <ArrowUpRight className="hover-nudge-x h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </div>

        <DialogClose className="sr-only">Close</DialogClose>
      </DialogContent>
    </Dialog>
  );
}
