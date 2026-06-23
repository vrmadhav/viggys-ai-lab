import { ArrowRight, Clock, Github, Layers, Linkedin, Twitter } from "lucide-react";
import { site } from "@/data/site";
import { getStats } from "@/data/stats";

export function Sidebar() {
  const stats = getStats();

  const statItems = [
    {
      label: "Projects",
      value: `${stats.projectsPublished}`,
      icon: Layers,
    },
    {
      label: "Latest",
      value: stats.latestProject ? "Updated" : "Soon",
      icon: Clock,
    },
  ];

  return (
    <aside className="space-y-8 pr-1 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="label-sm mb-4 inline-flex items-center gap-2 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
          About the lab
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{site.about}</p>
      </section>

      <section>
        <h3 className="label-sm mb-4 pl-1 text-muted-foreground">Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((s) => (
            <div
              key={s.label}
              className="flex min-h-28 flex-col justify-center rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <s.icon className="mb-2 h-4 w-4 text-muted-foreground" />
              <div className="font-display text-xl font-medium leading-tight">
                {s.value}
              </div>
              <div className="mt-1 text-xs leading-tight text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="label-sm mb-4 pl-1 text-muted-foreground">Quick Links</h3>
        <ul className="overflow-hidden rounded-3xl border border-border bg-card text-sm shadow-[var(--shadow-card)]">
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
                className="group flex items-center justify-between border-b border-border px-4 py-4 text-muted-foreground transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)] last:border-0 hover:bg-accent hover:text-foreground"
              >
                <span className="flex items-center gap-3">
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </span>
                <ArrowRight className="hover-nudge-x h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
