import fs from "node:fs";
import path from "node:path";

export type ProjectStatus = "live" | "in-progress" | "planned" | "archived";

export type ProjectLinks = {
  demo?: string;
  github?: string;
  writeup?: string;
  video?: string;
};

export type Project = {
  title: string;
  slug: string;
  status: ProjectStatus;
  dateCreated: string;
  dateUpdated: string;
  description: string;
  summary: string;
  image?: string;
  tags: string[];
  featured: boolean;
  links: ProjectLinks;
};

type ProjectMetadata = Record<string, unknown>;

const projectsDirectory = path.join(process.cwd(), "projects");

function normalizeStatus(value: unknown): ProjectStatus {
  if (
    value === "live" ||
    value === "in-progress" ||
    value === "planned" ||
    value === "archived"
  ) {
    return value;
  }

  return "planned";
}

function normalizeLinks(value: unknown): ProjectLinks {
  const raw = (value ?? {}) as Record<string, unknown>;
  const links: ProjectLinks = {};

  for (const key of ["demo", "github", "writeup", "video"] as const) {
    if (typeof raw[key] === "string" && raw[key].length > 0) {
      links[key] = raw[key];
    }
  }

  return links;
}

function normalizeProject(
  metadata: ProjectMetadata,
  fallbackSlug: string,
): Project | null {
  if (typeof metadata.title !== "string") return null;

  const slug = typeof metadata.slug === "string" ? metadata.slug : fallbackSlug;
  const status = normalizeStatus(metadata.status);
  const dateCreated =
    typeof metadata.dateCreated === "string" ? metadata.dateCreated : "";
  const dateUpdated =
    typeof metadata.dateUpdated === "string" ? metadata.dateUpdated : "";
  const description =
    typeof metadata.description === "string" ? metadata.description : "";
  const summary = typeof metadata.summary === "string" ? metadata.summary : "";
  const image = typeof metadata.image === "string" ? metadata.image : undefined;
  const featured = metadata.featured === true;
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return {
    title: metadata.title,
    slug,
    status,
    dateCreated,
    dateUpdated,
    description,
    tags,
    summary,
    image,
    featured,
    links: normalizeLinks(metadata.links),
  };
}

function readProjectMetadata(slug: string): Project | null {
  const metadataPath = path.join(projectsDirectory, slug, "metadata.json");

  if (!fs.existsSync(metadataPath)) return null;

  try {
    const rawMetadata = fs.readFileSync(metadataPath, "utf8");
    const metadata = JSON.parse(rawMetadata) as ProjectMetadata;

    return normalizeProject(metadata, slug);
  } catch {
    return null;
  }
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDirectory)) return [];

  const projects = fs
    .readdirSync(projectsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readProjectMetadata(entry.name))
    .filter((project): project is Project => project !== null);

  return projects.sort((a, b) => {
    const dateA = new Date(a.dateUpdated || a.dateCreated).getTime();
    const dateB = new Date(b.dateUpdated || b.dateCreated).getTime();

    if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
    if (Number.isNaN(dateA)) return 1;
    if (Number.isNaN(dateB)) return -1;

    return dateB - dateA;
  });
}

export function getProjectBySlug(slug: string): Project | null {
  return getAllProjects().find((project) => project.slug === slug) ?? null;
}

/** Reads the raw MDX write-up for a project, or null if it has none yet. */
export function getProjectContent(slug: string): string | null {
  const contentPath = path.join(projectsDirectory, slug, "content.mdx");

  if (!fs.existsSync(contentPath)) return null;

  try {
    return fs.readFileSync(contentPath, "utf8");
  } catch {
    return null;
  }
}
