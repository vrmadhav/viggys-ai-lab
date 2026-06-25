import { SparkleDust } from "@/components/lab/SparkleDust";
import { SparkleDustTuner } from "@/components/lab/SparkleDustTuner";

export function AmbientBg() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-background" />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
        <SparkleDust />
      </div>
      <SparkleDustTuner />
    </>
  );
}
