import { Github, Linkedin, Twitter, Layers, Users, Star } from "lucide-react";
import { site } from "@/data/site";
import { getStats } from "@/data/stats";

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function Sidebar() {
  const stats = getStats();

  const statItems = [
    {
      label: "Episodes Published",
      value: `${stats.episodesPublished}`,
      icon: Layers,
    },
    {
      label: "Total Visitors",
      value: formatNumber(stats.visitors),
      icon: Users,
    },
  ];

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-5 pr-1">
      {/* About */}
      <section className="glass card-glow rounded-2xl p-5">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan-glow)] shadow-[0_0_10px_var(--cyan-glow)]" />
          The thesis
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

        {/* Most popular */}
        {stats.mostPopular && (
          <a
            href={`#episode-${stats.mostPopular.slug}`}
            className="group mt-3 flex items-center gap-3 rounded-xl border border-border/60 bg-background/30 p-3 transition-colors hover:border-foreground/30"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-[var(--cyan-glow)]">
              <Star className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-widest text-muted-foreground">
                Most Popular
              </span>
              <span className="block truncate text-sm font-medium text-foreground">
                {stats.mostPopular.title}
              </span>
            </span>
          </a>
        )}
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
