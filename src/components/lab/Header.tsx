import Link from "next/link";
import { Github, Mail, Sparkles } from "lucide-react";
import { site } from "@/data/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/lab/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-medium tracking-normal">
            {site.name}
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <a href={site.links.github} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
          <Button asChild size="sm">
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
