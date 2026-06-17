import type { DailyArtist } from "../types";

export const dailyArtists: DailyArtist[] = [
  {
    id: "alma-thomas",
    name: "Alma Thomas",
    lifespan: "1891-1978",
    movement: "Washington Color School",
    region: "United States",
    date: "2026-06-16",
    summary:
      "A painter and educator whose late-career abstractions turned color, rhythm, and observation into luminous fields of short, pulsing marks.",
    whyToday:
      "Thomas is a useful first artist for the app because her work is immediately inviting, but the story underneath it opens into teaching, race, age, abstraction, and daily attention.",
    works: [
      {
        title: "Resurrection",
        year: "1966",
        medium: "Acrylic on canvas",
        imageAlt: "Concentric mosaic-like rings of bright color.",
      },
      {
        title: "Wind Dancing with Spring Flowers",
        year: "1969",
        medium: "Acrylic on canvas",
        imageAlt: "Vertical strokes of color arranged like moving light.",
      },
      {
        title: "The Eclipse",
        year: "1970",
        medium: "Acrylic on canvas",
        imageAlt: "Dense blue and violet marks surrounding a dark circular form.",
      },
    ],
    sources: [
      {
        label: "Smithsonian American Art Museum",
        url: "https://americanart.si.edu/artist/alma-thomas-4778",
      },
      {
        label: "National Gallery of Art",
        url: "https://www.nga.gov/collection/artist-info.3148.html",
      },
    ],
  },
];

export function getTodayArtist() {
  return dailyArtists[0];
}
