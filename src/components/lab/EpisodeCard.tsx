"use client";

import type { ReactNode } from "react";
import { Bot, Users } from "lucide-react";
import type { Episode, Track } from "@/lib/experiments";
import { EpisodeModal } from "./EpisodeModal";

function statusDotColor(status: Track["status"]) {
  if (status === "live") return "bg-emerald-400";
  if (status === "in-progress") return "bg-amber-400";
  return "bg-muted-foreground/40";
}

function TrackChip({
  label,
  icon: Icon,
  track,
}: {
  label: string;
  icon: typeof Bot;
  track: Track;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-2 py-1 text-[11px] text-muted-foreground">
      <Icon className="h-3 w-3" />
      {label}
      <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor(track.status)}`} />
    </span>
  );
}

export function EpisodeCard({
  episode,
  children,
}: {
  episode: Episode;
  children: ReactNode;
}) {
  const trigger = (
    <button
      type="button"
      id={`episode-${episode.slug}`}
      className="group flex min-h-72 scroll-mt-24 cursor-pointer flex-col rounded-2xl border border-border/70 bg-background/50 p-5 text-left transition-colors hover:border-foreground/30 hover:bg-background/80"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border/70 px-2 py-1 font-medium">
          {episode.episode === null
            ? "EP —"
            : `EP${String(episode.episode).padStart(2, "0")}`}
        </span>
        <span className="rounded-full border border-border/70 px-2 py-1">
          {episode.status || "in-progress"}
        </span>
      </div>

      <h2 className="font-display text-xl font-semibold tracking-normal text-foreground">
        {episode.title}
      </h2>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
        {episode.idea || episode.description || "Episode in progress."}
      </p>

      {episode.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {episode.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <TrackChip label="Prompt-Only" icon={Bot} track={episode.tracks.promptOnly} />
        <TrackChip label="Design" icon={Users} track={episode.tracks.designThinking} />
        <span className="ml-auto text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5">
          Preview →
        </span>
      </div>
    </button>
  );

  return (
    <EpisodeModal episode={episode} trigger={trigger}>
      {children}
    </EpisodeModal>
  );
}
