import type {
  CompiledImageRequest,
  ImageGenerationParameters,
  PromptCompilerInput,
} from "../types";

function formatSize(format?: string): ImageGenerationParameters["size"] {
  const value = format?.toLowerCase() ?? "";
  if (value.includes("portrait") || value.includes("vertical")) return "1024x1536";
  if (value.includes("landscape") || value.includes("wide")) return "1536x1024";
  return "1024x1024";
}

export function compileImagePrompt(
  input: PromptCompilerInput,
): CompiledImageRequest {
  const { workingIntent: intent, direction } = input;
  const decisions = Object.entries(direction.keyDecisions)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([key, value]) => `${key}: ${value}`);
  const locked = (input.lockedTraits ?? [])
    .map((trait) => {
      const key = trait as keyof typeof direction.keyDecisions;
      return direction.keyDecisions[key]
        ? `${trait}: ${direction.keyDecisions[key]}`
        : undefined;
    })
    .filter(Boolean);

  const sections = [
    `Creative thesis: ${direction.thesis}`,
    `Visual approach: ${direction.visualApproach}`,
    intent.objective && `Communication objective: ${intent.objective}`,
    intent.audience && `Audience: ${intent.audience}`,
    intent.desiredResponse && `Desired response: ${intent.desiredResponse}`,
    decisions.length && `Visual decisions: ${decisions.join("; ")}`,
    locked.length && `Preserve exactly: ${locked.join("; ")}`,
    intent.requiredText && `Required visible text: ${intent.requiredText}`,
    intent.constraints?.length && `Constraints: ${intent.constraints.join("; ")}`,
    intent.rejectedTraits?.length &&
      `Avoid: ${intent.rejectedTraits.join("; ")}`,
    input.revisionInstruction && `Revision: ${input.revisionInstruction}`,
    "Create one resolved image. Do not add unexplained typography, watermarks, borders, or signatures.",
  ].filter(Boolean);

  return {
    prompt: sections.join("\n"),
    parameters: { size: formatSize(intent.format), quality: "medium" },
    provider: input.provider,
  };
}

