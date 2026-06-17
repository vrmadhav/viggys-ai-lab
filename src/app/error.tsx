"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-2xl border border-border/60 p-8 text-center">
        <h1 className="font-display text-xl font-semibold">This page didn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something glitched in the lab. Try again or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-gradient-to-r from-[var(--violet-glow)] to-[var(--cyan-glow)] px-4 py-2 text-sm font-medium text-background"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border bg-background/40 px-4 py-2 text-sm"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
