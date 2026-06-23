import Image from "next/image";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Eye,
  PencilLine,
  Share2,
} from "lucide-react";
import { getTodayArtist } from "../data/artists";

export function ArtistOfTheDayApp() {
  const artist = getTodayArtist();

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-8 sm:max-w-2xl lg:max-w-5xl">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="bg-primary px-5 pt-5 pb-8 text-primary-foreground sm:px-7 sm:pt-7 lg:px-10 lg:pb-10">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Today
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Save artist"
                className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/25 text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70"
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Share artist"
                className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/25 text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-14">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
              One lesson in seeing
            </p>
            <h1 className="mt-3 font-display text-5xl leading-none font-medium tracking-normal sm:text-6xl">
              {artist.name}
            </h1>
            <p className="mt-3 text-sm text-primary-foreground/70">
              {artist.lifespan} · {artist.movement} · {artist.region}
            </p>
            <p className="mt-6 max-w-xl text-xl leading-8 text-primary-foreground">
              {artist.tastePrinciple}
            </p>
          </div>
        </div>

        <div className="space-y-8 px-5 py-6 sm:px-7 sm:py-8 lg:px-10">
          <section>
            <h2 className="font-display text-2xl font-medium">Why they matter</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {artist.summary}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium">Why today</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {artist.whyToday}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium">Train your eye</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-muted/45 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Weak takeaway
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {artist.weakTakeaway}
                </p>
              </div>
              <div className="rounded-2xl border border-primary bg-primary p-4 text-primary-foreground">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/60">
                  Better takeaway
                </p>
                <p className="mt-2 text-sm leading-6">
                  {artist.betterTakeaway}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {artist.visualVocabulary.map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {word}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium">Three works</h2>
            <div className="mt-3 grid gap-4 lg:grid-cols-3">
              {artist.works.map((work, index) => (
                <article
                  key={work.title}
                  className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={work.imageUrl}
                      alt={work.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 290px, (min-width: 640px) 600px, calc(100vw - 40px)"
                      className="h-full w-full object-cover"
                      priority={index === 0}
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
                      {index + 1}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-medium">{work.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {work.year} · {work.medium}
                    </p>
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        Notice this
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {work.lookingPrompt}
                      </p>
                    </div>
                    <p className="mt-3 rounded-2xl bg-muted/45 p-3 text-sm leading-6 text-foreground">
                      {work.tasteLesson}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium">Taste note</h2>
            <label className="mt-3 block rounded-3xl border border-border bg-muted/30 p-4">
              <span className="flex items-center gap-2 text-sm font-medium">
                <PencilLine className="h-4 w-4" />
                What would you steal as a principle, not a style?
              </span>
              <textarea
                className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-input bg-input-background p-3 text-sm leading-6 outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:shadow-[var(--shadow-focus)]"
                placeholder="Example: crop more aggressively, but keep the focal path obvious."
              />
            </label>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium">Questions for the eye</h2>
            <div className="mt-3 grid gap-2">
              {artist.trainingQuestions.map((question) => (
                <p
                  key={question}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-6 text-muted-foreground"
                >
                  {question}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium">Sources</h2>
            <div className="mt-3 grid gap-2">
              {artist.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{source.label}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
