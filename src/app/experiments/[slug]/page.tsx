import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllExperiments, getExperimentBySlug } from "@/lib/experiments";

export function generateStaticParams() {
  return getAllExperiments().map((experiment) => ({ slug: experiment.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exp = getExperimentBySlug(slug);

  if (!exp) return {};

  return {
    title: `${exp.title} - Viggy's AI Lab`,
    description: exp.description || "Experiment in progress.",
    openGraph: {
      title: `${exp.title} - Viggy's AI Lab`,
      description: exp.description || "Experiment in progress.",
    },
  };
}

export default async function ExperimentDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exp = getExperimentBySlug(slug);

  if (!exp) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <Link
        href="/"
        className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Back to Labs
      </Link>

      <article className="mt-10 rounded-lg border border-border/70 bg-background/50 p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border/70 px-2 py-1">
            {exp.week === null ? "Week TBD" : `Week ${exp.week}`}
          </span>
          <span className="rounded-full border border-border/70 px-2 py-1">
            {exp.status || "in-progress"}
          </span>
        </div>

        <h1 className="font-display text-4xl font-semibold tracking-normal sm:text-5xl">
          {exp.title}
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          {exp.description || "Experiment in progress."}
        </p>

        {exp.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {exp.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
