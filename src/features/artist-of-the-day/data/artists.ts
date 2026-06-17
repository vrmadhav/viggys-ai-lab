import type { DailyArtist } from "../types";

export const dailyArtists: DailyArtist[] = [
  {
    id: "katsushika-hokusai",
    name: "Katsushika Hokusai",
    lifespan: "1760-1849",
    movement: "Ukiyo-e",
    region: "Japan",
    date: "2026-06-16",
    summary:
      "A printmaker whose landscapes turn weather, scale, and line into unforgettable graphic decisions. Hokusai is famous because the images are beautiful, but they endure because the compositions are exact.",
    whyToday:
      "Hokusai is a strong first taste lesson because his work is easy to enter and hard to exhaust. A young designer can learn from his framing without copying the wave.",
    tastePrinciple:
      "Great composition makes the eye feel guided, not trapped.",
    weakTakeaway:
      "Make dramatic waves, mountains, and Japanese-inspired decoration.",
    betterTakeaway:
      "Use scale, cropping, rhythm, and negative space so the whole image feels inevitable.",
    visualVocabulary: [
      "framing",
      "line economy",
      "motion",
      "scale contrast",
      "negative space",
      "rhythm",
    ],
    trainingQuestions: [
      "Where does your eye go first, and what sends it there?",
      "What is being simplified so the image can feel stronger?",
      "What would a weaker designer copy from this?",
      "What should a better designer learn from it?",
    ],
    works: [
      {
        title: "The Great Wave off Kanagawa",
        year: "c. 1831",
        medium: "Color woodblock print",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/a/a5/Tsunami_by_hokusai_19th_century.jpg",
        imageAlt:
          "A large curling blue wave towers above small boats with Mount Fuji in the distance.",
        lookingPrompt:
          "Notice how the smallest mountain and the largest wave echo each other.",
        tasteLesson:
          "Scale contrast can make danger, distance, and focus happen at once.",
      },
      {
        title: "Fine Wind, Clear Morning",
        year: "c. 1830-1832",
        medium: "Color woodblock print",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/0/00/%E3%80%8C%E5%AF%8C%E5%B6%BD%E4%B8%89%E5%8D%81%E5%85%AD%E6%99%AF_%E5%87%B1%E9%A2%A8%E5%BF%AB%E6%99%B4%E3%80%8D-South_Wind%2C_Clear_Sky_%28Gaif%C5%AB_kaisei%29%2C_also_known_as_Red_Fuji%2C_from_the_series_Thirty-six_Views_of_Mount_Fuji_%28Fugaku_sanj%C5%ABrokkei%29_MET_DP141062.jpg",
        imageAlt:
          "A red Mount Fuji sits beneath bands of blue sky and a few small clouds.",
        lookingPrompt:
          "Notice how little is needed: mountain, sky, cloud, edge.",
        tasteLesson:
          "Restraint can make a simple layout feel monumental instead of empty.",
      },
      {
        title: "Ejiri in Suruga Province",
        year: "c. 1830-1832",
        medium: "Color woodblock print",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/1/12/Ejiri_in_the_Suruga_province.jpg",
        imageAlt:
          "Travelers bend into a sudden gust of wind while papers fly across a flat landscape.",
        lookingPrompt:
          "Notice how every diagonal helps you feel the same gust of wind.",
        tasteLesson:
          "Rhythm turns scattered details into one clear sensation.",
      },
    ],
    sources: [
      {
        label: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search?q=Katsushika%20Hokusai",
      },
      {
        label: "The British Museum",
        url: "https://www.britishmuseum.org/collection/term/BIOG2937",
      },
      {
        label: "Wikipedia: Katsushika Hokusai",
        url: "https://en.wikipedia.org/wiki/Hokusai",
      },
    ],
  },
];

export function getTodayArtist() {
  return dailyArtists[0];
}
