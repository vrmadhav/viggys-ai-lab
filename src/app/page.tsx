import type { Metadata } from "next";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowUpRight, CalendarDays, Star } from "lucide-react";
import { Sidebar } from "@/components/lab/Sidebar";
import { HeroAbout } from "@/components/lab/HeroAbout";
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
  const featuredProject =
    projects.find((project) => project.featured) ?? projects[0] ?? null;

  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-6 pb-12 sm:px-6 lg:pt-8">
      <HeroAbout />

      {featuredProject && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-surface/70 shadow-[0_32px_100px_-60px_var(--cyan-glow)] lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
          <div className="flex flex-col justify-between gap-8 p-5 sm:p-7 lg:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--cyan-glow)]/35 bg-background/35 px-2.5 py-1 text-[11px] uppercase tracking-widest text-[var(--cyan-glow)]">
                <Star className="h-3 w-3" />
                Featured project
              </div>
              <h2 className="mt-5 max-w-xl font-display text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                {featuredProject.title}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {featuredProject.summary || featuredProject.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/35 px-3 py-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Updated {featuredProject.dateUpdated || featuredProject.dateCreated}
              </span>
              {featuredProject.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/70 bg-background/35 px-3 py-1.5"
                >
                  {tag}
                </span>
              ))}
              <a
                href={`#project-${featuredProject.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 font-medium text-background transition-opacity hover:opacity-85"
              >
                Open
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="relative min-h-72 overflow-hidden border-t border-border/70 bg-muted/30 lg:min-h-96 lg:border-t-0 lg:border-l">
            {featuredProject.image ? (
              <Image
                src={featuredProject.image}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,var(--cyan-glow),transparent_35%),radial-gradient(circle_at_70%_65%,var(--violet-glow),transparent_38%)] opacity-55" />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-background/55 via-transparent to-background/10" />
          </div>
        </section>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />

        <div>
          <section className="mb-6">
            <h2 className="font-display text-2xl font-semibold tracking-normal">
              Projects
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              A running collection of things I&apos;m making, testing, and
              occasionally overthinking.
            </p>
          </section>

          {projects.length === 0 ? (
            <div className="rounded-lg border border-border/70 bg-background/50 p-8 text-sm text-muted-foreground">
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
