import "server-only";
import type { ImageGenerationProvider } from "../../types";
import { DEFAULT_OPENAI_IMAGE_MODEL } from "./config";
import { MockImageProvider } from "./mock-image-provider";
import { OpenAIImageProvider } from "./openai-image-provider";

export type ProviderSelection = {
  provider: ImageGenerationProvider;
  requested: string;
  fallback: boolean;
  model: string;
};

export function selectImageProvider(): ProviderSelection {
  const requested = (process.env.IMAGE_PROVIDER || "mock").toLowerCase();
  if (requested === "mock") {
    return { provider: new MockImageProvider(), requested, fallback: false, model: "deterministic-svg-v1" };
  }
  if (requested !== "openai") throw new Error("IMAGE_PROVIDER must be either 'openai' or 'mock'.");

  const openai = new OpenAIImageProvider();
  if (openai.isAvailable()) {
    return { provider: openai, requested, fallback: false, model: DEFAULT_OPENAI_IMAGE_MODEL };
  }
  if (process.env.NODE_ENV !== "production") {
    return { provider: new MockImageProvider(), requested, fallback: true, model: "deterministic-svg-v1" };
  }
  throw new Error("Image generation is not configured. Contact the site administrator.");
}

