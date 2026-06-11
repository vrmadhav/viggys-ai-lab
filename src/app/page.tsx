import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Sidebar } from "@/components/lab/Sidebar";
import { HeroAbout } from "@/components/lab/HeroAbout";
import { EpisodeCard } from "@/components/lab/EpisodeCard";
import { mdxComponents } from "@/components/lab/mdxComponents";
import { getAllExperiments, getEpisodeContent } from "@/lib/experiments";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.fullName} — building apps with and without design`,
  description: site.tagline,
  openGraph: {
    title: site.fullName,
    description: site.tagline,
  },
};

export default function Home() {
  const episodes = getAllExperiments();

  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-8 pb-12 sm:px-6">
      <HeroAbout />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />

        <div>
          <section className="mb-6">
            <h2 className="font-display text-2xl font-semibold tracking-normal">
              Episodes
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Each episode builds the same idea two ways. Open one to see the
              original idea, the prompt, and both builds.
            </p>
          </section>

          {episodes.length === 0 ? (
            <div className="rounded-lg border border-border/70 bg-background/50 p-8 text-sm text-muted-foreground">
              No episodes yet.
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {episodes.map((episode) => {
                const content = getEpisodeContent(episode.slug);

                return (
                  <EpisodeCard key={episode.slug} episode={episode}>
                    {content ? (
                      <MDXRemote source={content} components={mdxComponents} />
                    ) : (
                      <p className="text-sm leading-7 text-muted-foreground">
                        Write-up coming soon.
                      </p>
                    )}
                  </EpisodeCard>
                );
              })}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
