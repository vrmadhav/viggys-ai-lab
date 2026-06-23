import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Sidebar } from "@/components/lab/Sidebar";
import { ProjectCard } from "@/components/lab/ProjectCard";
import { mdxComponents } from "@/components/lab/mdxComponents";
import { getAllProjects, getProjectContent } from "@/lib/projects";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.fullName} — projects and experiments`,
  description: site.tagline,
  openGraph: {
    title: site.fullName,
    description: site.tagline,
  },
};

export default function Home() {
  const projects = getAllProjects();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
        <Sidebar />

        <div>
          {projects.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-[var(--shadow-card)]">
              No projects yet.
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project, index) => {
                const content = getProjectContent(project.slug);

                return (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    priority={index === 0}
                  >
                    {content ? (
                      <MDXRemote source={content} components={mdxComponents} />
                    ) : (
                      <p className="text-sm leading-7 text-muted-foreground">
                        Write-up coming soon.
                      </p>
                    )}
                  </ProjectCard>
                );
              })}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
