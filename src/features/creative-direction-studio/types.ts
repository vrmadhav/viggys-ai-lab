export type StudioStatus =
  | "gathering-context"
  | "clarifying-intent"
  | "ready-to-explore"
  | "exploring"
  | "refining";

export type GuidancePreference = "create" | "guide" | "teach";

export type ContextItem = {
  id: string;
  type: "text";
  content: string;
  createdAt: string;
};

export type WorkingIntent = {
  objective?: string;
  audience?: string;
  desiredResponse?: string;
  coreIdea?: string;
  subject?: string;
  environment?: string;
  composition?: string;
  mood?: string;
  visualLanguage?: string;
  color?: string;
  lighting?: string;
  camera?: string;
  format?: string;
  requiredText?: string;
  constraints?: string[];
  rejectedTraits?: string[];
  acceptedDecisions?: string[];
  unresolvedQuestions?: string[];
};

export type ImageGenerationParameters = {
  size: "1024x1024" | "1536x1024" | "1024x1536";
  quality?: "low" | "medium" | "high";
};

export type GeneratedImage = {
  id: string;
  url: string;
  prompt: string;
  provider: string;
  model?: string;
  createdAt: string;
  directionId?: string;
  parentImageId?: string;
  changedTraits?: string[];
  preservedTraits?: string[];
  alt: string;
};

export type CreativeDirection = {
  id: string;
  title: string;
  thesis: string;
  visualApproach: string;
  emotionalEffect: string;
  whyItFits: string;
  tradeoffs: string[];
  keyDecisions: Partial<
    Pick<
      WorkingIntent,
      | "subject"
      | "environment"
      | "composition"
      | "mood"
      | "visualLanguage"
      | "color"
      | "lighting"
      | "camera"
    >
  >;
  previewImage?: GeneratedImage;
  status: "proposed" | "generating" | "ready" | "failed" | "rejected";
  parentDirectionIds?: string[];
  error?: string;
};

export type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type IntentUpdateResult = {
  assistantMessage: string;
  updatedIntent: WorkingIntent;
  status: StudioStatus;
  shouldOfferExploration: boolean;
  contradiction?: { description: string; options?: string[] };
};

export type PromptCompilerInput = {
  workingIntent: WorkingIntent;
  direction: CreativeDirection;
  lockedTraits?: string[];
  revisionInstruction?: string;
  provider: string;
};

export type CompiledImageRequest = {
  prompt: string;
  parameters: ImageGenerationParameters;
  provider: string;
};

export type ImageGenerationResult = {
  provider: string;
  model?: string;
  imageUrl?: string;
  base64?: string;
  revisedPrompt?: string;
  metadata?: Record<string, unknown>;
};

export type ImageGenerationProvider = {
  id: string;
  isAvailable(): boolean;
  generate(input: CompiledImageRequest): Promise<ImageGenerationResult>;
};

