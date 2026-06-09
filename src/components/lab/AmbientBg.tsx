export function AmbientBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
        className="aurora-a absolute -top-40 -left-32 h-[55vmax] w-[55vmax] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--violet-glow), transparent 70%)",
        }}
      />
      <div
        className="aurora-b absolute top-1/3 -right-40 h-[50vmax] w-[50vmax] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--cyan-glow), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
    </div>
  );
}
