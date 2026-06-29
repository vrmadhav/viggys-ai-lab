import type { Metadata } from "next";
import { WorldCupBracketApp } from "@/features/world-cup-bracket/components/WorldCupBracketApp";

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 Bracket | Viggy's Lab",
  description:
    "A live-updating FIFA World Cup 2026 knockout bracket with click-to-predict picks for upcoming matches.",
};

export default function WorldCupBracketPage() {
  return <WorldCupBracketApp />;
}
