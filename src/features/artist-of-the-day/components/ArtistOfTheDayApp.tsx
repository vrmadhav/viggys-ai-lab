import { ArrowUpRight, Bookmark, CalendarDays, Share2 } from "lucide-react";
import { getTodayArtist } from "../data/artists";

export function ArtistOfTheDayApp() {
  const artist = getTodayArtist();

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pt-5 pb-10 sm:max-w-2xl lg:max-w-5xl">
      <section className="overflow-hidden rounded-[28px] border border-border bg-background shadow-[0_24px_80px_-64px_var(--foreground)]">
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
                className="grid h-9 w-9 place-items-center rounded-full border border-background/25 text-background transition-colors hover:bg-background/10"
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Share artist"
                className="grid h-9 w-9 place-items-center rounded-full border border-background/25 text-background transition-colors hover:bg-background/10"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-16">
            <p className="text-xs uppercase tracking-[0.18em] text-background/65">
              Artist of the day
            </p>
            <h1 className="mt-3 font-display text-5xl leading-none font-bold tracking-normal sm:text-6xl">
              {artist.name}
            </h1>
            <p className="mt-3 text-sm text-background/70">
              {artist.lifespan} · {artist.movement} · {artist.region}
            </p>
          </div>
        </div>

        <div className="space-y-7 px-5 py-6">
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
            <h2 className="text-sm font-semibold">Three works</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {artist.works.map((work, index) => (
                <article
                  key={work.title}
                  className="rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="grid aspect-[4/5] place-items-center rounded-md bg-[linear-gradient(135deg,var(--color-muted),var(--color-background))] text-4xl font-semibold text-muted-foreground">
                    {index + 1}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{work.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {work.year} · {work.medium}
                  </p>
                </article>
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
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
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
