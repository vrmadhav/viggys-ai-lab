import type { Metadata } from "next";
import { CreativeDirectionStudio } from "@/features/creative-direction-studio/components/CreativeDirectionStudio";

export const metadata: Metadata = {
  title: "Creative Direction Studio | Viggy's Lab",
  description: "Develop, compare, and refine visual ideas with an AI creative director—before the prompt.",
};

export default function CreativeDirectionStudioPage() {
  return <CreativeDirectionStudio />;
}

