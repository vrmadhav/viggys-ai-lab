"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, FileText, Bot, Users } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Episode, Track } from "@/lib/experiments";

function trackStatusLabel(status: Track["status"]) {
  if (status === "live") return "Live";
  if (status === "in-progress") return "In progress";
  return "Coming soon";
}

function TrackButton({
  track,
  label,
  icon: Icon,
  accent,
}: {
  track: Track;
  label: string;
  icon: typeof Bot;
  accent: "violet" | "cyan";
}) {
  const ring =
    accent === "violet"
      ? "border-[var(--violet-glow)]/40 hover:border-[var(--violet-glow)]"
      : "border-[var(--cyan-glow)]/40 hover:border-[var(--cyan-glow)]";
  const iconColor =
    accent === "violet" ? "text-[var(--violet-glow)]" : "text-[var(--cyan-glow)]";

  const inner = (
    <>
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/50 ${iconColor}`}>
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-[11px] text-muted-foreground">
          {trackStatusLabel(track.status)}
        </span>
      </span>
      {track.url && <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
    </>
  );

  if (track.url) {
    return (
      <a
        href={track.url}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-3 rounded-xl border bg-background/30 p-3 transition-colors ${ring}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border/50 bg-background/20 p-3 opacity-60">
      {inner}
    </div>
  );
}

export function EpisodeModal({
  episode,
  trigger,
  children,
}: {
  episode: Episode;
  trigger: ReactNode;
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="glass max-h-[88vh] w-[calc(100vw-2rem)] max-w-2xl gap-0 overflow-y-auto rounded-2xl border-border/60 p-0 sm:rounded-2xl">
        {/* Header / preview */}
        <div className="border-b border-border/50 p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/70 px-2 py-1">
              {episode.episode === null ? "Episode TBD" : `Episode ${episode.episode}`}
            </span>
            <span className="rounded-full border border-border/70 px-2 py-1">
              {episode.status || "in-progress"}
            </span>
          </div>

          <DialogTitle className="font-display text-2xl font-semibold tracking-normal">
            {episode.title}
          </DialogTitle>

          {episode.idea && (
            <DialogDescription className="mt-3 text-sm leading-7 text-muted-foreground">
              {episode.idea}
            </DialogDescription>
          )}

          {episode.promptUrl && (
            <a
              href={episode.promptUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/40"
            >
              <FileText className="h-3.5 w-3.5" />
              View the prompt
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <TrackButton
              track={episode.tracks.promptOnly}
              label="Prompt-Only build"
              icon={Bot}
              accent="violet"
            />
            <TrackButton
              track={episode.tracks.designThinking}
              label="Design-Thinking build"
              icon={Users}
              accent="cyan"
            />
          </div>
        </div>

        {/* MDX write-up */}
        <div className="p-6">{children}</div>

        <DialogClose className="sr-only">Close</DialogClose>
      </DialogContent>
    </Dialog>
  );
}
