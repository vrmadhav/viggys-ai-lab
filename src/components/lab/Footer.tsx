import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-base italic text-muted-foreground">
          Built one project at a time.
        </p>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <a className="transition-colors hover:text-foreground" href={site.links.github} target="_blank" rel="noreferrer">GitHub</a>
          <a className="transition-colors hover:text-foreground" href={`mailto:${site.email}`}>Contact</a>
          <a className="transition-colors hover:text-foreground" href={site.links.rss}>RSS</a>
          <a className="transition-colors hover:text-foreground" href={site.links.newsletter} target="_blank" rel="noreferrer">Newsletter</a>
        </nav>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Viggy&apos;s Lab</p>
      </div>
    </footer>
  );
}
