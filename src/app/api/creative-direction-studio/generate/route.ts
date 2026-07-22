import { NextResponse } from "next/server";
import { z } from "zod";
import { directionSchema, workingIntentSchema } from "@/features/creative-direction-studio/lib/schemas";
import { compileImagePrompt } from "@/features/creative-direction-studio/lib/prompt-compiler";
import { selectImageProvider } from "@/features/creative-direction-studio/server/image-providers";

const requestSchema = z.object({
  workingIntent: workingIntentSchema,
  direction: directionSchema.passthrough(),
  lockedTraits: z.array(z.string()).default([]),
  revisionInstruction: z.string().max(4000).optional(),
  parentImageId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const selection = selectImageProvider();
    const compiled = compileImagePrompt({
      workingIntent: input.workingIntent,
      direction: input.direction,
      lockedTraits: input.lockedTraits,
      revisionInstruction: input.revisionInstruction,
      provider: selection.provider.id,
    });
    const result = await selection.provider.generate(compiled);
    const mimeType = typeof result.metadata?.mimeType === "string" ? result.metadata.mimeType : "image/png";
    const url = result.imageUrl || (result.base64 ? `data:${mimeType};base64,${result.base64}` : undefined);
    if (!url) throw new Error("Image response was empty.");

    return NextResponse.json({
      image: {
        id: crypto.randomUUID(),
        url,
        prompt: compiled.prompt,
        provider: result.provider,
        model: result.model,
        createdAt: new Date().toISOString(),
        directionId: input.direction.id,
        parentImageId: input.parentImageId,
        changedTraits: input.revisionInstruction ? [input.revisionInstruction] : [],
        preservedTraits: input.lockedTraits,
        alt: `Visual preview for ${input.direction.title}: ${input.direction.thesis}`,
      },
      diagnostics: { requestedProvider: selection.requested, activeProvider: result.provider, fallback: selection.fallback, model: result.model },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed. Your work is unchanged.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

