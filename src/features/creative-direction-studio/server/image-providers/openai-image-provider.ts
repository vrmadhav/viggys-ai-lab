import "server-only";
import OpenAI from "openai";
import type {
  CompiledImageRequest,
  ImageGenerationProvider,
  ImageGenerationResult,
} from "../../types";
import { DEFAULT_OPENAI_IMAGE_MODEL } from "./config";

export class OpenAIImageProvider implements ImageGenerationProvider {
  id = "openai";

  isAvailable() {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async generate(input: CompiledImageRequest): Promise<ImageGenerationResult> {
    if (!this.isAvailable()) throw new Error("OpenAI image generation is not configured.");

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const response = await client.images.generate({
        model: DEFAULT_OPENAI_IMAGE_MODEL,
        prompt: input.prompt,
        size: input.parameters.size,
        quality: input.parameters.quality,
      });
      const image = response.data?.[0];
      if (!image?.b64_json && !image?.url) throw new Error("No image was returned.");

      return {
        provider: this.id,
        model: DEFAULT_OPENAI_IMAGE_MODEL,
        base64: image.b64_json,
        imageUrl: image.url,
        revisedPrompt: image.revised_prompt,
      };
    } catch (error) {
      const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
      if (status === 429) throw new Error("Image generation is busy or rate-limited. Try again shortly.");
      throw new Error("OpenAI could not generate this image. Your work is still saved; try again.");
    }
  }
}

