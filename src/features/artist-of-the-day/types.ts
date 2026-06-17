export type Artwork = {
  title: string;
  year: string;
  medium: string;
  imageAlt: string;
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
  works: Artwork[];
  sources: {
    label: string;
    url: string;
  }[];
};
