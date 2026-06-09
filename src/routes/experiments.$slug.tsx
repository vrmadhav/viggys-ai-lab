import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Github,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import { useEffect } from "react";
import { experiments, getExperimentBySlug, type Experiment } from "@/data/experiments";
import { reportLovableError } from "@/lib/lovable-error-reporting";

export const Route = createFileRoute("/experiments/$slug")({
  loader: ({ params }) => {
    const exp = getExperimentBySlug(params.slug);
    if (!exp) throw notFound();
    return exp;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Viggy's AI Lab` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.title} — Viggy's AI Lab` },
          { property: "og:description", content: loaderData.description },
          { property: "og:image", content: loaderData.image },
          { name: "twitter:image", content: loaderData.image },
        ]
      : [],
  }),
  component: ExperimentDetail,
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});

const STATUS_STYLES = {
  Live: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  "In Progress": "bg-amber-400/15 text-amber-300 border-amber-400/30",
  Archived: "bg-zinc-400/15 text-zinc-300 border-zinc-400/30",
} as const;

function ExperimentDetail() {
  const exp = Route.useLoaderData() as Experiment;

  const idx = experiments.findIndex((e) => e.slug === exp.slug);
  const prev = idx > 0 ? experiments[idx - 1] : undefined;
  const next = idx < experiments.length - 1 ? experiments[idx + 1] : undefined;

  return (
    <main className="mx-auto max-w-4xl px-4 pt-8 pb-16 sm:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to the lab
      </Link>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-3xl border border-border/60 glass card-glow"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={exp.image}
            alt={exp.title}
            width={1024}
            height={768}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 backdrop-blur-md">
                Week {exp.week.toString().padStart(2, "0")}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 backdrop-blur-md ${STATUS_STYLES[exp.status]}`}
              >
                {exp.status}
              </span>
              {exp.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl font-semibold leading-tight sm:text-5xl">
              {exp.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-foreground/80">
              {exp.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border/60 bg-background/30 p-4 text-sm">
          {exp.demoUrl && (
            <a
              href={exp.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--violet-glow)] to-[var(--cyan-glow)] px-3 py-1.5 font-medium text-background"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Live demo
            </a>
          )}
          {exp.sourceUrl && (
            <a
              href={exp.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-3 py-1.5"
            >
              <Github className="h-3.5 w-3.5" /> Source
            </a>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Built in {exp.buildTime}
          </span>
        </div>
      </motion.section>

      {/* Content */}
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
        <article className="space-y-10 md:col-span-2">
          <Section title="Overview">
            <p>{exp.overview}</p>
          </Section>
          <Section title="Problem">
            <p>{exp.problem}</p>
          </Section>

          {exp.screenshots.length > 0 && (
            <Section title="Screenshots">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {exp.screenshots.map((s, i) => (
                  <img
                    key={i}
                    src={s}
                    alt={`${exp.title} screenshot ${i + 1}`}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="aspect-[4/3] w-full rounded-xl border border-border/60 object-cover"
                  />
                ))}
              </div>
            </Section>
          )}

          <Section title="Challenges">
            <ul className="list-disc space-y-1.5 pl-5 marker:text-[var(--violet-glow)]">
              {exp.challenges.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Section>

          <Section title="Lessons">
            <ul className="list-disc space-y-1.5 pl-5 marker:text-[var(--cyan-glow)]">
              {exp.lessons.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Section>

          {/* Featured weekly learning */}
          <section className="relative overflow-hidden rounded-3xl border border-border/60 glass card-glow p-6 sm:p-8">
            <div
              aria-hidden
              className="aurora-a pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, var(--violet-glow), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                <Sparkles className="h-3 w-3 text-[var(--cyan-glow)]" />
                What I Learned This Week
              </div>
              <p className="font-display text-xl leading-snug text-foreground sm:text-2xl">
                {exp.weeklyLearning}
              </p>
            </div>
          </section>
        </article>

        <aside className="space-y-5">
          <SidebarBlock title="Tech stack">
            <div className="flex flex-wrap gap-1.5">
              {exp.techStack.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </SidebarBlock>
          <SidebarBlock title="Published">
            <p className="text-sm text-foreground/80">
              {new Date(exp.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </SidebarBlock>
          <SidebarBlock title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {exp.tags.map((t) => (
                <Link
                  key={t}
                  to="/"
                  search={{ q: "", tag: t, status: "All" }}
                  className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </SidebarBlock>
        </aside>
      </div>

      {/* Prev / next */}
      <nav className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            to="/experiments/$slug"
            params={{ slug: prev.slug }}
            className="group glass rounded-2xl border border-border/60 p-4 transition-colors hover:bg-background/40"
          >
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              ← Previous
            </div>
            <div className="mt-1 font-display text-base font-medium">{prev.title}</div>
          </Link>
        ) : <span />}
        {next ? (
          <Link
            to="/experiments/$slug"
            params={{ slug: next.slug }}
            className="group glass rounded-2xl border border-border/60 p-4 text-right transition-colors hover:bg-background/40"
          >
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Next →
            </div>
            <div className="mt-1 inline-flex items-center justify-end gap-1.5 font-display text-base font-medium">
              {next.title} <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        ) : <span />}
      </nav>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-semibold">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/85">
        {children}
      </div>
    </section>
  );
}

function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl border border-border/60 p-4">
      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function NotFound() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold text-gradient">Not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That experiment hasn't been shipped yet.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-lg bg-gradient-to-r from-[var(--violet-glow)] to-[var(--cyan-glow)] px-4 py-2 text-sm font-medium text-background"
      >
        Back to the lab
      </Link>
    </main>
  );
}

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "experiment_detail" });
  }, [error]);
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">Something broke</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="mt-6 rounded-lg bg-gradient-to-r from-[var(--violet-glow)] to-[var(--cyan-glow)] px-4 py-2 text-sm font-medium text-background"
      >
        Try again
      </button>
    </main>
  );
}
