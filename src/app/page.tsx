import type { Metadata } from "next";
import { Sidebar } from "@/components/lab/Sidebar";
import { Hero } from "@/components/lab/Hero";
import { LabLog } from "@/components/lab/LabLog";
import { ExperimentsExplorer } from "@/components/lab/ExperimentsExplorer";
import { validateExperimentsSearch } from "@/lib/searchSchema";

export const metadata: Metadata = {
  title: "Viggy's AI Lab — Weekly AI experiments",
  description:
    "An open laboratory shipping a new AI experiment every week. Ideas, prototypes, and what I learned along the way.",
  openGraph: {
    title: "Viggy's AI Lab",
    description:
      "Weekly AI experiments, creative prototypes, and tiny bets on the future.",
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { q, tag, status } = validateExperimentsSearch(await searchParams);

  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-8 pb-12 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <div className="space-y-14">
          <Hero />
          <ExperimentsExplorer q={q} tag={tag} status={status} />
          <LabLog />
        </div>
      </div>
    </main>
  );
}
