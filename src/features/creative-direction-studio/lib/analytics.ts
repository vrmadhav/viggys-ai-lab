export type StudioEvent =
  | "experiment_opened"
  | "context_added"
  | "working_intent_updated"
  | "contradiction_surfaced"
  | "exploration_requested"
  | "directions_generated"
  | "direction_selected"
  | "direction_rejected"
  | "directions_combined"
  | "image_generation_requested"
  | "image_generated"
  | "image_generation_failed"
  | "image_provider_fallback"
  | "refinement_requested"
  | "trait_locked"
  | "trait_unlocked"
  | "guidance_preference_changed"
  | "generation_prompt_viewed"
  | "session_reset";

// The archive has no analytics vendor. This intentionally keeps a single safe hook
// and never accepts prompt or user-content payloads.
export function trackStudioEvent(event: StudioEvent, metadata?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("creative-direction-studio:analytics", { detail: { event, metadata } }));
}
