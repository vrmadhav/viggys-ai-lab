import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/lab/Sidebar";
import { Hero } from "@/components/lab/Hero";
import { LabLog } from "@/components/lab/LabLog";
import { ExperimentsExplorer } from "@/components/lab/ExperimentsExplorer";
import { validateExperimentsSearch, type ExperimentsSearch } from "@/lib/searchSchema";

export const Route = createFileRoute("/")({
  validateSearch: (raw: Record<string, unknown>): ExperimentsSearch =>
    validateExperimentsSearch(raw),
  head: () => ({
    meta: [
      { title: "Viggy's AI Lab — Weekly AI experiments" },
      {
        name: "description",
        content:
          "An open laboratory shipping a new AI experiment every week. Ideas, prototypes, and what I learned along the way.",
      },
      { property: "og:title", content: "Viggy's AI Lab" },
      {
        property: "og:description",
        content: "Weekly AI experiments, creative prototypes, and tiny bets on the future.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { q, tag, status } = Route.useSearch();
  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-8 pb-12 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <div className="space-y-14">
          <Hero />
          <ExperimentsExplorer q={q} tag={tag} status={status} from="/" />
          <LabLog />
        </div>
      </div>
    </main>
  );
}
