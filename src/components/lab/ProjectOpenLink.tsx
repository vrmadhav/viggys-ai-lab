"use client";

import type { MouseEvent, ReactNode } from "react";

export function ProjectOpenLink({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: ReactNode;
}) {
  const targetId = `project-${slug}`;

  function openProject(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    const trigger = document.getElementById(targetId);

    if (!(trigger instanceof HTMLButtonElement)) {
      return;
    }

    event.preventDefault();
    window.history.pushState(null, "", `#${targetId}`);
    trigger.click();
  }

  return (
    <a href={`#${targetId}`} className={className} onClick={openProject}>
      {children}
    </a>
  );
}
