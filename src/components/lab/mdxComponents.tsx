import type { ComponentProps } from "react";

// Styling map for the MDX project write-ups rendered inside the modal.
export const mdxComponents = {
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="mt-7 mb-2 font-display text-lg font-bold tracking-normal text-foreground first:mt-0"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="mt-5 mb-2 font-display text-base font-bold tracking-normal text-foreground"
      {...props}
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="mt-3 text-sm leading-7 text-muted-foreground" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-7 text-muted-foreground"
      {...props}
    />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-7 text-muted-foreground"
      {...props}
    />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8em] text-foreground"
      {...props}
    />
  ),
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
};
