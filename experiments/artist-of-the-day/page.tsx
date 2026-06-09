import Link from "next/link";

export default function ArtistOfTheDayExperiment() {
  return (
    <main className="min-h-screen p-8">
      <Link href="/" className="text-sm underline">
        Back to Labs
      </Link>

      <section className="mt-12 max-w-3xl">
        <p className="text-sm uppercase tracking-wide opacity-60">
          AI Experiment
        </p>

        <h1 className="mt-3 text-5xl font-bold">
          Artist Of The Day
        </h1>

        <p className="mt-6 text-lg opacity-80">
          Experiment in progress.
        </p>
      </section>
    </main>
  );
}
