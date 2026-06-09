import Link from "next/link";
import { Github, Mail, Sparkles } from "lucide-react";
import { site } from "@/data/site";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--violet-glow)] to-[var(--cyan-glow)] shadow-[0_8px_30px_-10px_var(--violet-glow)]">
            <Sparkles className="h-3.5 w-3.5 text-background" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            {site.name}
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <a href={site.links.github} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
          <Button asChild size="sm" className="gap-2">
            <a href={`mailto:${site.email}`}>
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
