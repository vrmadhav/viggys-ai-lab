import Link from "next/link";
import { Github, Mail, Sparkles } from "lucide-react";
import { site } from "@/data/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/lab/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="relative inline-flex h-7 w-7 items-center justify-center border border-foreground bg-foreground">
            <Sparkles className="h-3.5 w-3.5 text-background" />
          </span>
          <span className="font-display text-base font-bold tracking-normal">
            {site.name}
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <ThemeToggle />
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
