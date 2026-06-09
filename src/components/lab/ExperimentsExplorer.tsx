"use client";

import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { experiments, type ExperimentStatus } from "@/data/experiments";
import { ExperimentCard } from "./ExperimentCard";

const STATUSES: (ExperimentStatus | "All")[] = ["All", "Live", "In Progress", "Archived"];

type Props = {
  q: string;
  tag: string;
  status: string;
};

export function ExperimentsExplorer({ q, tag, status }: Props) {
  const router = useRouter();

  const allTags = useMemo(
    () => Array.from(new Set(experiments.flatMap((e) => e.tags))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return experiments.filter((e) => {
      if (status && status !== "All" && e.status !== status) return false;
      if (tag && !e.tags.includes(tag)) return false;
      if (term) {
        const hay = `${e.title} ${e.description} ${e.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [q, tag, status]);

  const setSearch = (next: Partial<{ q: string; tag: string; status: string }>) => {
    const merged = { q, tag, status, ...next };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.tag) params.set("tag", merged.tag);
    if (merged.status && merged.status !== "All") params.set("status", merged.status);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  };

  const hasFilters = q || (tag && tag.length > 0) || (status && status !== "All");

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            The archive
          </div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Experiments</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} of {experiments.length}
        </span>
      </div>

      {/* Search + filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setSearch({ q: e.target.value })}
            placeholder="Search experiments, tags, ideas..."
            className="w-full rounded-xl border border-border bg-background/40 px-10 py-2.5 text-sm placeholder:text-muted-foreground focus:border-[var(--violet-glow)] focus:outline-none focus:ring-2 focus:ring-[var(--violet-glow)]/30"
          />
          {hasFilters && (
            <button
              onClick={() => setSearch({ q: "", tag: "", status: "All" })}
              className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-background/60 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((s) => {
            const active = (status || "All") === s;
            return (
              <button
                key={s}
                onClick={() => setSearch({ status: s })}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? "border-[var(--violet-glow)]/60 bg-[var(--violet-glow)]/15 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
          <span className="mx-1 h-4 w-px bg-border" />
          {allTags.map((t) => {
            const active = tag === t;
            return (
              <button
                key={t}
                onClick={() => setSearch({ tag: active ? "" : t })}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? "border-[var(--cyan-glow)]/60 bg-[var(--cyan-glow)]/15 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                #{t}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-border/60 p-10 text-center text-sm text-muted-foreground">
          No experiments match those filters yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <ExperimentCard key={e.id} experiment={e} />
          ))}
        </div>
      )}
    </section>
  );
}
