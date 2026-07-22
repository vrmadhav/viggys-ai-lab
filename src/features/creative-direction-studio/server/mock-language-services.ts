import type {
  CreativeDirection,
  IntentUpdateResult,
  WorkingIntent,
} from "../types";

function contains(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function unique(values: string[] | undefined, next: string) {
  return Array.from(new Set([...(values ?? []), next]));
}

export function updateIntentMock(
  previous: WorkingIntent,
  contribution: string,
): IntentUpdateResult {
  const text = contribution.trim();
  const lower = text.toLowerCase();
  const intent: WorkingIntent = structuredClone(previous);

  if (!intent.objective) intent.objective = text;
  else intent.coreIdea = text;
  if (contains(lower, ["audience", "financial", "conservative", "for executives"])) {
    intent.audience = text;
  }
  if (contains(lower, ["lonely", "loneliness", "isolated", "reflective", "warm", "tragic", "calm"])) {
    intent.mood = text;
  }
  if (contains(lower, ["small in the frame", "far away", "distant", "close-up", "intimate", "centered"])) {
    intent.composition = text;
  }
  if (contains(lower, ["subject", "person", "human", "object", "figure"])) intent.subject = text;
  if (contains(lower, ["graphic", "documentary", "surreal", "raw", "polished", "photograph", "illustration"])) {
    intent.visualLanguage = text;
  }
  if (contains(lower, ["warm", "cool", "muted", "color", "monochrome", "red", "blue"])) intent.color = text;
  if (contains(lower, ["light", "lighting", "shadow", "sunlit"])) intent.lighting = text;
  if (contains(lower, ["landscape", "wide", "portrait", "vertical", "square"])) intent.format = text;
  if (contains(lower, ["avoid", "not ", "less ", "don't", "do not", "dislike", "too "])) {
    intent.rejectedTraits = unique(intent.rejectedTraits, text);
  }
  if (contains(lower, ["keep", "preserve", "lock", "i like", "works"])) {
    intent.acceptedDecisions = unique(intent.acceptedDecisions, text);
  }

  const tensionContext = `${previous.composition ?? ""} ${previous.mood ?? ""} ${intent.composition ?? ""} ${intent.mood ?? ""} ${text}`.toLowerCase();
  const distant = contains(tensionContext, ["distant", "far away", "small in the frame"]);
  const intimate = contains(tensionContext, ["intimate", "close-up", "emotionally close"]);
  const contradiction = distant && intimate
    ? {
        description: "You have described the image as both intimate and emotionally distant. Those can coexist, but one should dominate the composition.",
        options: ["Prioritize intimacy", "Prioritize distance", "Use distance with one intimate detail"],
      }
    : undefined;

  const contextCount = Object.values(intent).filter(Boolean).length;
  let assistantMessage = "I’ve folded that into the working intent.";
  if (contradiction) assistantMessage = "There’s a useful tension here rather than a simple conflict.";
  else if (contextCount < 3) assistantMessage += " Should the idea communicate through a literal scene, or through a more symbolic image?";
  else assistantMessage += " There is enough here to explore three distinct visual strategies, and you can keep adding context first if you prefer.";

  return {
    assistantMessage,
    updatedIntent: intent,
    status: contradiction ? "clarifying-intent" : contextCount >= 3 ? "ready-to-explore" : "gathering-context",
    shouldOfferExploration: contextCount >= 2,
    contradiction,
  };
}

export function generateDirectionsMock(intent: WorkingIntent): CreativeDirection[] {
  const objective = intent.objective || intent.coreIdea || "the core idea";
  const common = {
    mood: intent.mood,
    color: intent.color,
    lighting: intent.lighting,
  };
  return [
    {
      id: crypto.randomUUID(),
      title: "The Human Distance",
      thesis: `Make ${objective.toLowerCase()} felt through scale, distance, and a believable human moment.`,
      visualApproach: "A restrained observational scene with a small subject and an environment that carries much of the emotional weight.",
      emotionalEffect: "Quiet recognition; the viewer discovers the feeling rather than being told what to feel.",
      whyItFits: "It turns the brief into a legible human situation while preserving ambiguity and restraint.",
      tradeoffs: ["More immediately relatable, but less visually surprising than the symbolic route."],
      keyDecisions: { ...common, subject: intent.subject || "A single human presence", environment: intent.environment || "A specific, lived-in setting", composition: intent.composition || "Wide frame; subject occupies less than ten percent", visualLanguage: "Observational photography with imperfect, credible detail", camera: intent.camera || "Eye-level, physically distant" },
      status: "proposed",
    },
    {
      id: crypto.randomUUID(),
      title: "The Unsaid Object",
      thesis: `Translate ${objective.toLowerCase()} into one unexpected physical metaphor, without illustrating it literally.`,
      visualApproach: "An object-centered still life where material, spacing, and one visual contradiction create the idea.",
      emotionalEffect: "A slower, more interpretive encounter that rewards attention and feels less conventional.",
      whyItFits: "It avoids generic AI narrative imagery and can carry the idea with editorial precision.",
      tradeoffs: ["More distinctive and ownable, but the metaphor may need careful calibration for broad audiences."],
      keyDecisions: { ...common, subject: "One familiar object behaving in an unfamiliar way", environment: "Sparse constructed set with tactile surfaces", composition: "Graphic asymmetry with deliberate negative space", visualLanguage: "Material-led conceptual still life", camera: "Near-orthographic studio view" },
      status: "proposed",
    },
    {
      id: crypto.randomUUID(),
      title: "The Broken Signal",
      thesis: `Express ${objective.toLowerCase()} as a bold system of repetition, interruption, and visual rhythm.`,
      visualApproach: "A graphic, semi-abstract image built from repeated forms, with one disruption acting as the focal event.",
      emotionalEffect: "Immediate visual tension and memorability, with less dependence on a literal subject.",
      whyItFits: "It can speak clearly at campaign scale and offers the greatest distance from familiar generated-image aesthetics.",
      tradeoffs: ["Strongest at a glance, but sacrifices some human warmth and narrative specificity."],
      keyDecisions: { ...common, subject: "A field of repeated forms interrupted once", environment: "Flattened spatial field", composition: "Strong rhythm with one off-axis break", visualLanguage: "Graphic image-making combining print texture and dimensional form", camera: "Flattened, poster-like perspective" },
      status: "proposed",
    },
  ];
}

export function refineDirectionMock(
  direction: CreativeDirection,
  instruction: string,
  lockedTraits: string[],
): CreativeDirection {
  const lower = instruction.toLowerCase();
  const next = structuredClone(direction);
  const updates: Partial<CreativeDirection["keyDecisions"]> = {};
  if (contains(lower, ["warm", "cool", "palette", "color"])) updates.color = instruction;
  if (contains(lower, ["light", "shadow", "sunlit"])) updates.lighting = instruction;
  if (contains(lower, ["camera", "farther", "closer", "close-up"])) updates.camera = instruction;
  if (contains(lower, ["composition", "frame", "center", "space"])) updates.composition = instruction;
  if (contains(lower, ["background", "environment", "setting"])) updates.environment = instruction;
  if (contains(lower, ["subject", "person", "figure", "object"])) updates.subject = instruction;
  if (contains(lower, ["raw", "polished", "graphic", "documentary", "surreal", "generic"])) updates.visualLanguage = instruction;
  if (contains(lower, ["mood", "dramatic", "quiet", "tense", "calm"])) updates.mood = instruction;
  for (const key of lockedTraits) delete updates[key as keyof typeof updates];
  next.keyDecisions = { ...next.keyDecisions, ...updates };
  next.id = crypto.randomUUID();
  next.title = `${direction.title} · Revision`;
  next.parentDirectionIds = [direction.id];
  next.status = "proposed";
  next.previewImage = undefined;
  return next;
}
