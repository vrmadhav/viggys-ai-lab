import { getAllProjects, type Project } from "@/lib/projects";

export type LabStats = {
  projectsPublished: number;
  latestProject: Project | null;
};

export function getStats(): LabStats {
  const projects = getAllProjects();

  return {
    projectsPublished: projects.length,
    latestProject: projects[0] ?? null,
  };
}
