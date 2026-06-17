"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FlaskConical, Hammer, Sparkles } from "lucide-react";
import { site } from "@/data/site";

const VISITED_KEY = "lab:visited";

const noopSubscribe = () => () => {};
function getVisitedSnapshot() {
  try {
    return window.localStorage.getItem(VISITED_KEY) !== null;
  } catch {
    return false;
  }
}

export function HeroAbout() {
  // Return visitors get a collapsed hero; first-timers see the full intro.
  // Reading via useSyncExternalStore keeps SSR/hydration consistent and avoids
  // a setState-in-effect flash.
  const visited = useSyncExternalStore(
    noopSubscribe,
    getVisitedSnapshot,
    () => false,
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const expanded = override ?? !visited;

  // Mark this visitor as seen for next time (write-only side effect).
  useEffect(() => {
    try {
      window.localStorage.setItem(VISITED_KEY, "1");
    } catch {
      // ignore (private mode / storage disabled)
    }
  }, []);

  return (
    <section className="glass card-glow relative overflow-hidden rounded-3xl p-6 sm:p-8">
      {/* inner aurora glows */}
      <div
        aria-hidden
        className="aurora-a pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--violet-glow), transparent)" }}
      />
      <div
        aria-hidden
        className="aurora-b pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--cyan-glow), transparent)" }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan-glow)] shadow-[0_0_10px_var(--cyan-glow)]" />
              Personal lab notes
            </div>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-normal sm:text-5xl">
              <span className="inline-block bg-gradient-to-r from-foreground via-[var(--violet-glow)] to-[var(--cyan-glow)] bg-clip-text text-transparent">
                {site.fullName}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {site.tagline}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOverride(!expanded)}
            aria-expanded={expanded}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {expanded ? "Hide intro" : "Show intro"}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="intro"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <p className="text-sm leading-7 text-foreground/85">{site.about}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Apps",
                      sublabel: "Small tools and prototypes",
                      icon: Hammer,
                    },
                    {
                      label: "Experiments",
                      sublabel: "Ideas worth testing in public",
                      icon: FlaskConical,
                    },
                    {
                      label: "Notes",
                      sublabel: "What changed while building",
                      icon: Sparkles,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-border/60 bg-background/30 p-4"
                    >
                      <item.icon className="mb-3 h-4 w-4 text-[var(--cyan-glow)]" />
                      <h2 className="font-display text-sm font-semibold tracking-normal">
                        {item.label}
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.sublabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
