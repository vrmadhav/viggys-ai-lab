import { Github, Linkedin, Twitter, Layers, Clock } from "lucide-react";
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
    <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-5 pr-1">
      {/* About */}
      <section className="glass card-glow p-5">
        <div className="label-sm mb-2 inline-flex items-center gap-2 border border-border bg-background px-2.5 py-1 text-muted-foreground">
          <span className="h-1.5 w-1.5 bg-foreground" />
          About the lab
        </div>
        <p className="body-sm text-foreground/85">{site.about}</p>
      </section>

      {/* Stats */}
      <section className="glass p-5">
        <h3 className="label-sm mb-3 text-muted-foreground">
          Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((s) => (
            <div
              key={s.label}
              className="border border-border bg-background/50 p-3"
            >
              <s.icon className="mb-1.5 h-3.5 w-3.5 text-foreground" />
              <div className="font-display text-lg font-bold leading-tight">
                {s.value}
              </div>
              <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Quick links */}
      <section className="glass p-5">
        <h3 className="label-sm mb-3 text-muted-foreground">
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
                className="group flex items-center justify-between border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-background/60"
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
