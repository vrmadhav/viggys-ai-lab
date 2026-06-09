import fs from "node:fs";
import path from "node:path";

export type Experiment = {
  title: string;
  slug: string;
  status: string;
  week: number | null;
  dateCreated: string;
  description: string;
  tags: string[];
};

type ExperimentMetadata = Partial<Record<keyof Experiment, unknown>>;

const experimentsDirectory = path.join(process.cwd(), "experiments");

function normalizeExperiment(
  metadata: ExperimentMetadata,
  fallbackSlug: string,
): Experiment | null {
  if (typeof metadata.title !== "string") return null;

  const slug = typeof metadata.slug === "string" ? metadata.slug : fallbackSlug;
  const status = typeof metadata.status === "string" ? metadata.status : "";
  const dateCreated =
    typeof metadata.dateCreated === "string" ? metadata.dateCreated : "";
  const description =
    typeof metadata.description === "string" ? metadata.description : "";
  const week = typeof metadata.week === "number" ? metadata.week : null;
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return {
    title: metadata.title,
    slug,
    status,
    week,
    dateCreated,
    description,
    tags,
  };
}

function readExperimentMetadata(slug: string): Experiment | null {
  const metadataPath = path.join(experimentsDirectory, slug, "metadata.json");

  if (!fs.existsSync(metadataPath)) return null;

  try {
    const rawMetadata = fs.readFileSync(metadataPath, "utf8");
    const metadata = JSON.parse(rawMetadata) as ExperimentMetadata;

    return normalizeExperiment(metadata, slug);
  } catch {
    return null;
  }
}

export function getAllExperiments(): Experiment[] {
  if (!fs.existsSync(experimentsDirectory)) return [];

  const experiments = fs
    .readdirSync(experimentsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readExperimentMetadata(entry.name))
    .filter((experiment): experiment is Experiment => experiment !== null);

  return experiments.sort((a, b) => {
    const dateA = new Date(a.dateCreated).getTime();
    const dateB = new Date(b.dateCreated).getTime();

    if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
    if (Number.isNaN(dateA)) return 1;
    if (Number.isNaN(dateB)) return -1;

    return dateB - dateA;
  });
}

export function getExperimentBySlug(slug: string): Experiment | null {
  return getAllExperiments().find((experiment) => experiment.slug === slug) ?? null;
}
