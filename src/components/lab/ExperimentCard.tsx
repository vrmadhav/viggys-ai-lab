import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Experiment } from "@/data/experiments";

const STATUS_STYLES: Record<Experiment["status"], string> = {
  Live: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  "In Progress": "bg-amber-400/15 text-amber-300 border-amber-400/30",
  Archived: "bg-zinc-400/15 text-zinc-300 border-zinc-400/30",
};

export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative"
    >
      <Link
        to="/experiments/$slug"
        params={{ slug: experiment.slug }}
        className="block overflow-hidden rounded-2xl border border-border/60 glass transition-shadow duration-300 group-hover:shadow-[0_30px_80px_-30px_var(--violet-glow)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={experiment.image}
            alt={experiment.title}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[11px] backdrop-blur-md">
              W{experiment.week.toString().padStart(2, "0")}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] backdrop-blur-md ${STATUS_STYLES[experiment.status]}`}
            >
              {experiment.status}
            </span>
          </div>
          <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/70 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-105">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight">
              {experiment.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-foreground/75">
              {experiment.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {experiment.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
            <span>{new Date(experiment.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span className="text-[var(--cyan-glow)] opacity-0 transition-opacity group-hover:opacity-100">
              Preview →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
