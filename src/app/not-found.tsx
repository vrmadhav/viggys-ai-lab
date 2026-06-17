import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass card-glow max-w-md border border-border p-8 text-center">
        <h1 className="headline-md">404</h1>
        <h2 className="mt-3 font-display text-xl font-medium">Lost in the lab</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That project doesn&apos;t exist, or hasn&apos;t been shipped yet.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Back to the lab
          </Link>
        </div>
      </div>
    </div>
  );
}
