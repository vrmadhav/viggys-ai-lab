import type { Metadata } from "next";
import { ArtistOfTheDayApp } from "@/features/artist-of-the-day/components/ArtistOfTheDayApp";

export const metadata: Metadata = {
  title: "Artist Of The Day | Viggy's AI Lab",
  description:
    "A mobile-first daily ritual for meeting one artist and a few representative works.",
};

export default function ArtistOfTheDayPage() {
  return <ArtistOfTheDayApp />;
}
