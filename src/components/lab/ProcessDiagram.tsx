import { Lightbulb, Sparkles, Bot, Users, Code2, GitCompareArrows } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function Node({
  icon: Icon,
  label,
  sublabel,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  accent?: "violet" | "cyan";
}) {
  const ring =
    accent === "violet"
      ? "border-[var(--violet-glow)]/40 text-[var(--violet-glow)]"
      : accent === "cyan"
        ? "border-[var(--cyan-glow)]/40 text-[var(--cyan-glow)]"
        : "border-border/70 text-foreground/70";

  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background/30 p-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background/40 ${ring}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-tight text-foreground">
          {label}
        </span>
        {sublabel && (
          <span className="block text-[11px] leading-tight text-muted-foreground">
            {sublabel}
          </span>
        )}
      </span>
    </div>
  );
}

export function ProcessDiagram() {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/20 p-4 sm:p-5">
      {/* Shared start: idea -> prompt */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Node icon={Lightbulb} label="An idea" sublabel="The spark for the episode" />
        <Node
          icon={Sparkles}
          label="Research + prompt"
          sublabel="A quick LLM back-and-forth"
        />
      </div>

      {/* Fork label */}
      <div className="my-3 flex items-center gap-3">
        <span className="h-px flex-1 bg-border/60" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Same idea, two paths
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>

      {/* Two lanes */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Prompt-Only */}
        <div className="rounded-xl border border-[var(--violet-glow)]/25 bg-[var(--violet-glow)]/[0.04] p-3">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--violet-glow)]">
            Prompt-Only
          </p>
          <div className="space-y-2">
            <Node icon={Bot} label="Hand the prompt to AI" sublabel="e.g. Lovable" accent="violet" />
            <Node icon={Sparkles} label="AI decides what gets built" accent="violet" />
          </div>
        </div>

        {/* Design-Thinking */}
        <div className="rounded-xl border border-[var(--cyan-glow)]/25 bg-[var(--cyan-glow)]/[0.04] p-3">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--cyan-glow)]">
            Design-Thinking
          </p>
          <div className="space-y-2">
            <Node icon={Users} label="User research + design" sublabel="My own mods applied" accent="cyan" />
            <Node icon={Code2} label="AI for coding only" accent="cyan" />
          </div>
        </div>
      </div>

      {/* Converge: compare */}
      <div className="mt-3">
        <Node
          icon={GitCompareArrows}
          label="Compare the two apps"
          sublabel="Does design thinking actually matter?"
        />
      </div>
    </div>
  );
}
