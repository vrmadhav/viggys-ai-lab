"use client";

import { motion } from "framer-motion";
import { site } from "@/data/site";
import { getStats } from "@/data/stats";

export function Hero() {
  const stats = getStats();
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 glass px-6 py-14 sm:px-10 sm:py-20 card-glow">
      {/* inner aurora */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div
          className="aurora-a absolute -left-20 -top-20 h-72 w-72 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--violet-glow), transparent 70%)" }}
        />
        <div
          className="aurora-b absolute -right-10 bottom-0 h-80 w-80 rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--cyan-glow), transparent 70%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative max-w-3xl"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--cyan-glow)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--cyan-glow)]" />
          </span>
          Lab is open · Week {Math.max(...[stats.all, 1])} of {stats.missionTotal}
        </div>

        <h1 className="font-display text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
          <span className="text-gradient">{site.fullName}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-foreground/80 sm:text-lg">
          {site.tagline}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1">
            {stats.shipped} shipped
          </span>
          <span className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1">
            {stats.streak}-week streak
          </span>
          <span className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1">
            Updated {new Date(stats.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </motion.div>
    </section>
  );
}
