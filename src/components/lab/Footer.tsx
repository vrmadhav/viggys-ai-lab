import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-sm text-foreground/80">
          Built one project at a time.
        </p>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <a className="hover:text-foreground" href={site.links.github} target="_blank" rel="noreferrer">GitHub</a>
          <a className="hover:text-foreground" href={`mailto:${site.email}`}>Contact</a>
          <a className="hover:text-foreground" href={site.links.rss}>RSS</a>
          <a className="hover:text-foreground" href={site.links.newsletter} target="_blank" rel="noreferrer">Newsletter</a>
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Viggy&apos;s AI Lab</p>
      </div>
    </footer>
  );
}
