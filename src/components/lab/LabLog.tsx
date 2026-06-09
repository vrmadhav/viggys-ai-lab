import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Lightbulb, GraduationCap, BookOpen, Rocket, CheckCircle2 } from "lucide-react";
import { labLog, type LabLogType } from "@/data/labLog";

const META: Record<LabLogType, { label: string; icon: typeof Lightbulb; color: string }> = {
  idea: { label: "Idea", icon: Lightbulb, color: "text-amber-300" },
  learning: { label: "Learning", icon: GraduationCap, color: "text-[var(--cyan-glow)]" },
  reflection: { label: "Reflection", icon: BookOpen, color: "text-fuchsia-300" },
  progress: { label: "Progress", icon: Rocket, color: "text-sky-300" },
  shipped: { label: "Shipped", icon: CheckCircle2, color: "text-emerald-300" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function LabLog() {
  return (
    <section className="relative">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Live feed
          </div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Lab Log</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The journey — not just the finished experiments.
          </p>
        </div>
      </div>

      <ol className="relative space-y-4 border-l border-border/60 pl-6">
        {labLog.map((entry, i) => {
          const m = META[entry.type];
          const Icon = m.icon;
          return (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="relative"
            >
              <span className="absolute -left-[31px] top-3 inline-flex h-4 w-4 items-center justify-center rounded-full border border-border/60 bg-background">
                <Icon className={`h-2.5 w-2.5 ${m.color}`} />
              </span>
              <div className="glass rounded-xl border border-border/60 p-4">
                <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span className={m.color}>{m.label}</span>
                  <span>·</span>
                  <span>{formatDate(entry.date)}</span>
                </div>
                <h3 className="font-display text-base font-medium leading-snug">
                  {entry.title}
                </h3>
                <p className="mt-1 text-sm text-foreground/80">{entry.body}</p>
                {entry.relatedSlug && (
                  <Link
                    to="/experiments/$slug"
                    params={{ slug: entry.relatedSlug }}
                    className="mt-2 inline-block text-xs text-[var(--cyan-glow)] hover:underline"
                  >
                    View experiment →
                  </Link>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
