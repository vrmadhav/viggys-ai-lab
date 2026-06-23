export function AmbientBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-x-0 top-0 h-32 border-b border-border/50 bg-surface/50" />
    </div>
  );
}
