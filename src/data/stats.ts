import { getAllExperiments, type Episode } from "@/lib/experiments";
import { site } from "./site";

export type SeriesStats = {
  episodesPublished: number;
  visitors: number;
  mostPopular: Episode | null;
};

export function getStats(): SeriesStats {
  const episodes = getAllExperiments();

  const mostPopular =
    episodes.find((episode) => episode.popular) ?? episodes[0] ?? null;

  return {
    episodesPublished: episodes.length,
    visitors: site.visitors,
    mostPopular,
  };
}
