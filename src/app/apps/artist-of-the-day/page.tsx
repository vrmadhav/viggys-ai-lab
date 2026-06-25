import type { Metadata } from "next";
import { ArtistOfTheDayApp } from "@/features/artist-of-the-day/components/ArtistOfTheDayApp";

export const metadata: Metadata = {
  title: "Artist Of The Day | Viggy's Lab",
  description:
    "A mobile-first daily ritual for training visual taste through one artist and a few guided looking prompts.",
};

export default function ArtistOfTheDayPage() {
  return <ArtistOfTheDayApp />;
}
