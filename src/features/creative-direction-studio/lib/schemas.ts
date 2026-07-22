import { z } from "zod";

export const workingIntentSchema = z.object({
  objective: z.string().optional(),
  audience: z.string().optional(),
  desiredResponse: z.string().optional(),
  coreIdea: z.string().optional(),
  subject: z.string().optional(),
  environment: z.string().optional(),
  composition: z.string().optional(),
  mood: z.string().optional(),
  visualLanguage: z.string().optional(),
  color: z.string().optional(),
  lighting: z.string().optional(),
  camera: z.string().optional(),
  format: z.string().optional(),
  requiredText: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  rejectedTraits: z.array(z.string()).optional(),
  acceptedDecisions: z.array(z.string()).optional(),
  unresolvedQuestions: z.array(z.string()).optional(),
});

export const directionSchema = z.object({
  id: z.string(),
  title: z.string(),
  thesis: z.string(),
  visualApproach: z.string(),
  emotionalEffect: z.string(),
  whyItFits: z.string(),
  tradeoffs: z.array(z.string()).min(1),
  keyDecisions: z.record(z.string(), z.string()),
  status: z.enum(["proposed", "generating", "ready", "failed", "rejected"]),
  parentDirectionIds: z.array(z.string()).optional(),
});

