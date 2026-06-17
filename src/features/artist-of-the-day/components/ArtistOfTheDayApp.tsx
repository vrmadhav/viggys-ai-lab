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
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pt-5 pb-10 sm:max-w-2xl lg:max-w-5xl">
      <section className="overflow-hidden border border-border bg-background shadow-[0_24px_80px_-64px_var(--foreground)]">
        <div className="bg-foreground px-5 pt-5 pb-7 text-background">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Today
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Save artist"
                className="grid h-9 w-9 place-items-center border border-background/25 text-background transition-colors hover:bg-background/10"
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Share artist"
                className="grid h-9 w-9 place-items-center border border-background/25 text-background transition-colors hover:bg-background/10"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-14">
            <p className="text-xs uppercase tracking-[0.18em] text-background/65">
              One lesson in seeing
            </p>
            <h1 className="mt-3 font-display text-5xl leading-none font-bold tracking-normal sm:text-6xl">
              {artist.name}
            </h1>
            <p className="mt-3 text-sm text-background/70">
              {artist.lifespan} · {artist.movement} · {artist.region}
            </p>
            <p className="mt-6 max-w-xl text-xl leading-8 text-background">
              {artist.tastePrinciple}
            </p>
          </div>
        </div>

        <div className="space-y-8 px-5 py-6">
          <section>
            <h2 className="text-sm font-semibold">Why they matter</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {artist.summary}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Why today</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {artist.whyToday}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Train your eye</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Weak takeaway
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {artist.weakTakeaway}
                </p>
              </div>
              <div className="border border-foreground bg-foreground p-4 text-background">
                <p className="text-xs uppercase tracking-[0.14em] text-background/60">
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
                  className="border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {word}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Three works</h2>
            <div className="mt-3 grid gap-4 lg:grid-cols-3">
              {artist.works.map((work, index) => (
                <article
                  key={work.title}
                  className="overflow-hidden border border-border bg-muted/20"
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
                    <span className="absolute left-3 top-3 bg-background/90 px-2 py-1 text-xs font-semibold text-foreground backdrop-blur">
                      {index + 1}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold">{work.title}</h3>
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
                    <p className="mt-3 bg-background p-3 text-sm leading-6 text-foreground">
                      {work.tasteLesson}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Taste note</h2>
            <label className="mt-3 block border border-border bg-muted/20 p-4">
              <span className="flex items-center gap-2 text-sm font-medium">
                <PencilLine className="h-4 w-4" />
                What would you steal as a principle, not a style?
              </span>
              <textarea
                className="mt-3 min-h-28 w-full resize-none border border-border bg-background p-3 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                placeholder="Example: crop more aggressively, but keep the focal path obvious."
              />
            </label>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Questions for the eye</h2>
            <div className="mt-3 grid gap-2">
              {artist.trainingQuestions.map((question) => (
                <p
                  key={question}
                  className="border border-border px-3 py-2 text-sm leading-6 text-muted-foreground"
                >
                  {question}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Sources</h2>
            <div className="mt-3 grid gap-2">
              {artist.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  className="flex items-center justify-between gap-3 border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
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
