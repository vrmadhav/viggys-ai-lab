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
    <main className="mx-auto max-w-[1400px] px-4 pt-6 pb-12 sm:px-6 lg:pt-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />

        <div>
          {projects.length === 0 ? (
            <div className="border border-border bg-background/50 p-8 text-sm text-muted-foreground">
              No projects yet.
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const content = getProjectContent(project.slug);

                return (
                  <ProjectCard key={project.slug} project={project}>
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
