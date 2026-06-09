import { Github, Linkedin, Twitter, FlaskConical, Calendar, Users, Activity } from "lucide-react";
import { site } from "@/data/site";
import { getStats } from "@/data/stats";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function Sidebar() {
  const stats = getStats();
  const pct = Math.round(stats.missionProgress * 100);

  const statItems = [
    { label: "Experiments Shipped", value: `${stats.shipped}`, icon: FlaskConical },
    { label: "Current Streak", value: `${stats.streak} wk`, icon: Activity },
    { label: "Total Visitors", value: formatNumber(stats.visitors), icon: Users },
    { label: "Last Updated", value: formatDate(stats.lastUpdated), icon: Calendar },
  ];

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-5 pr-1">
      {/* About */}
      <section className="glass card-glow rounded-2xl p-5">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan-glow)] shadow-[0_0_10px_var(--cyan-glow)]" />
          About
        </div>
        <p className="text-sm leading-relaxed text-foreground/85">{site.about}</p>
      </section>

      {/* Stats */}
      <section className="glass rounded-2xl p-5">
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-background/30 p-3"
            >
              <s.icon className="mb-1.5 h-3.5 w-3.5 text-[var(--violet-glow)]" />
              <div className="font-display text-lg font-semibold leading-tight">
                {s.value}
              </div>
              <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="glass rounded-2xl p-5">
        <h3 className="mb-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Current Mission
        </h3>
        <p className="font-display text-base font-medium">
          52 AI Experiments in 52 Weeks
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{stats.all} / {stats.missionTotal}</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--violet-glow)] to-[var(--cyan-glow)] transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      {/* Quick links */}
      <section className="glass rounded-2xl p-5">
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Quick Links
        </h3>
        <ul className="space-y-2 text-sm">
          {[
            { label: "GitHub", href: site.links.github, icon: Github },
            { label: "LinkedIn", href: site.links.linkedin, icon: Linkedin },
            { label: "X / Twitter", href: site.links.twitter, icon: Twitter },
          ].map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-background/40"
              >
                <span className="flex items-center gap-2">
                  <l.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                  {l.label}
                </span>
                <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
