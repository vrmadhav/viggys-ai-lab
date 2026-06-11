import fs from "node:fs";
import path from "node:path";

export type TrackStatus = "live" | "in-progress" | "planned";

export type Track = {
  url?: string;
  status: TrackStatus;
};

export type Episode = {
  title: string;
  slug: string;
  episode: number | null;
  status: string;
  dateCreated: string;
  description: string;
  idea: string;
  promptUrl: string;
  tags: string[];
  popular: boolean;
  tracks: {
    promptOnly: Track;
    designThinking: Track;
  };
};

/** @deprecated Use {@link Episode}. Kept as an alias during the migration. */
export type Experiment = Episode;

type EpisodeMetadata = Record<string, unknown>;

const experimentsDirectory = path.join(process.cwd(), "experiments");

function normalizeTrack(value: unknown): Track {
  const raw = (value ?? {}) as Record<string, unknown>;
  const status =
    raw.status === "live" || raw.status === "in-progress"
      ? raw.status
      : "planned";
  const url = typeof raw.url === "string" && raw.url.length > 0 ? raw.url : undefined;

  return { status, url };
}

function normalizeEpisode(
  metadata: EpisodeMetadata,
  fallbackSlug: string,
): Episode | null {
  if (typeof metadata.title !== "string") return null;

  const slug = typeof metadata.slug === "string" ? metadata.slug : fallbackSlug;
  const status = typeof metadata.status === "string" ? metadata.status : "";
  const dateCreated =
    typeof metadata.dateCreated === "string" ? metadata.dateCreated : "";
  const description =
    typeof metadata.description === "string" ? metadata.description : "";
  const idea = typeof metadata.idea === "string" ? metadata.idea : "";
  const promptUrl =
    typeof metadata.promptUrl === "string" ? metadata.promptUrl : "";
  const episode =
    typeof metadata.episode === "number" ? metadata.episode : null;
  const popular = metadata.popular === true;
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  const tracksRaw = (metadata.tracks ?? {}) as Record<string, unknown>;

  return {
    title: metadata.title,
    slug,
    episode,
    status,
    dateCreated,
    description,
    idea,
    promptUrl,
    tags,
    popular,
    tracks: {
      promptOnly: normalizeTrack(tracksRaw.promptOnly),
      designThinking: normalizeTrack(tracksRaw.designThinking),
    },
  };
}

function readEpisodeMetadata(slug: string): Episode | null {
  const metadataPath = path.join(experimentsDirectory, slug, "metadata.json");

  if (!fs.existsSync(metadataPath)) return null;

  try {
    const rawMetadata = fs.readFileSync(metadataPath, "utf8");
    const metadata = JSON.parse(rawMetadata) as EpisodeMetadata;

    return normalizeEpisode(metadata, slug);
  } catch {
    return null;
  }
}

export function getAllExperiments(): Episode[] {
  if (!fs.existsSync(experimentsDirectory)) return [];

  const episodes = fs
    .readdirSync(experimentsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readEpisodeMetadata(entry.name))
    .filter((episode): episode is Episode => episode !== null);

  return episodes.sort((a, b) => {
    // Newest episode number first; fall back to creation date.
    if (a.episode !== null && b.episode !== null) return b.episode - a.episode;
    if (a.episode !== null) return -1;
    if (b.episode !== null) return 1;

    const dateA = new Date(a.dateCreated).getTime();
    const dateB = new Date(b.dateCreated).getTime();

    if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
    if (Number.isNaN(dateA)) return 1;
    if (Number.isNaN(dateB)) return -1;

    return dateB - dateA;
  });
}

export function getExperimentBySlug(slug: string): Episode | null {
  return getAllExperiments().find((episode) => episode.slug === slug) ?? null;
}

/** Reads the raw MDX write-up for an episode, or null if it has none yet. */
export function getEpisodeContent(slug: string): string | null {
  const contentPath = path.join(experimentsDirectory, slug, "content.mdx");

  if (!fs.existsSync(contentPath)) return null;

  try {
    return fs.readFileSync(contentPath, "utf8");
  } catch {
    return null;
  }
}
