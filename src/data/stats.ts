import { experiments } from "./experiments";
import { labLog } from "./labLog";
import { site } from "./site";

export function getStats() {
  const shipped = experiments.filter((e) => e.status === "Live").length;
  const all = experiments.length;

  // Streak = consecutive most-recent weeks with a shipped or in-progress experiment
  const sorted = [...experiments].sort((a, b) => b.week - a.week);
  let streak = 0;
  let expectedWeek = sorted[0]?.week ?? 0;
  for (const exp of sorted) {
    if (exp.week === expectedWeek) {
      streak += 1;
      expectedWeek -= 1;
    } else {
      break;
    }
  }

  const allDates = [
    ...experiments.map((e) => e.publishedAt),
    ...labLog.map((l) => l.date),
  ].sort();
  const lastUpdated = allDates[allDates.length - 1] ?? new Date().toISOString();

  return {
    shipped,
    all,
    streak,
    lastUpdated,
    visitors: site.visitors,
    missionTotal: site.missionTotal,
    missionProgress: Math.min(1, all / site.missionTotal),
  };
}
