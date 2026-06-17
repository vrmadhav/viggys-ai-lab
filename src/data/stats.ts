import { getAllProjects, type Project } from "@/lib/projects";

export type LabStats = {
  projectsPublished: number;
  latestProject: Project | null;
  featuredProject: Project | null;
};

export function getStats(): LabStats {
  const projects = getAllProjects();

  const featuredProject =
    projects.find((project) => project.featured) ?? projects[0] ?? null;

  return {
    projectsPublished: projects.length,
    latestProject: projects[0] ?? null,
    featuredProject,
  };
}
