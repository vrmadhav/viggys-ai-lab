import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <h1 className="headline-md">404</h1>
        <h2 className="mt-3 font-display text-xl font-medium">Lost in the lab</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That project doesn&apos;t exist, or hasn&apos;t been shipped yet.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">Back to the lab</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
