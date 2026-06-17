export type Artwork = {
  title: string;
  year: string;
  medium: string;
  imageUrl: string;
  imageAlt: string;
  lookingPrompt: string;
  tasteLesson: string;
};

export type DailyArtist = {
  id: string;
  name: string;
  lifespan: string;
  movement: string;
  region: string;
  date: string;
  summary: string;
  whyToday: string;
  tastePrinciple: string;
  weakTakeaway: string;
  betterTakeaway: string;
  visualVocabulary: string[];
  trainingQuestions: string[];
  works: Artwork[];
  sources: {
    label: string;
    url: string;
  }[];
};
