import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/lab/Sidebar";
import { getAllExperiments } from "@/lib/experiments";

export const metadata: Metadata = {
  title: "Viggy's AI Lab - Weekly AI experiments",
  description:
    "An open laboratory shipping a new AI experiment every week. Ideas, prototypes, and what I learned along the way.",
  openGraph: {
    title: "Viggy's AI Lab",
    description:
      "Weekly AI experiments, creative prototypes, and tiny bets on the future.",
  },
};

export default function Home() {
  const experiments = getAllExperiments();

  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-8 pb-12 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />

        <div>
          <section className="mb-10">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Viggy&apos;s AI Lab
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-normal sm:text-5xl">
              Labs
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              A living archive of weekly AI experiments, prototypes, and notes
              from the workbench.
            </p>
          </section>

          {experiments.length === 0 ? (
            <div className="rounded-lg border border-border/70 bg-background/50 p-8 text-sm text-muted-foreground">
              No experiments found yet.
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {experiments.map((experiment) => (
                <Link
                  key={experiment.slug}
                  href={`/experiments/${experiment.slug}`}
                  className="group flex min-h-64 flex-col rounded-lg border border-border/70 bg-background/50 p-5 transition-colors hover:border-foreground/30 hover:bg-background/80"
                >
                  <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border/70 px-2 py-1">
                      {experiment.week === null
                        ? "Week TBD"
                        : `Week ${experiment.week}`}
                    </span>
                    <span className="rounded-full border border-border/70 px-2 py-1">
                      {experiment.status || "in-progress"}
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-semibold tracking-normal text-foreground">
                    {experiment.title}
                  </h2>
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
                    {experiment.description || "Experiment in progress."}
                  </p>

                  {experiment.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-2 pt-6">
                      {experiment.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
