"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  CircleAlert,
  GitBranch,
  History,
  Lightbulb,
  LoaderCircle,
  Lock,
  LockOpen,
  Merge,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { trackStudioEvent } from "../lib/analytics";
import type {
  ContextItem,
  ConversationMessage,
  CreativeDirection,
  GeneratedImage,
  GuidancePreference,
  IntentUpdateResult,
  StudioStatus,
  WorkingIntent,
} from "../types";

const STORAGE_KEY = "creative-direction-studio:v1";
const starters = [
  "I need an image about loneliness, but I do not want it to feel tragic.",
  "Help me create a visual about humans working alongside AI.",
  "I want a campaign image that feels premium without looking like luxury advertising.",
  "I know the feeling I want, but not the subject.",
  "Help me find a less obvious way to communicate speed.",
];
const lockableTraits = ["subject", "composition", "environment", "mood", "color", "lighting", "camera", "visualLanguage", "requiredText"];

type Diagnostics = {
  languageProvider: string;
  imageProvider: string;
  requestedProvider?: string;
  isMock: boolean;
  fallback?: boolean;
  model: string;
};

type PersistedState = {
  contextItems: ContextItem[];
  conversation: ConversationMessage[];
  workingIntent: WorkingIntent;
  directions: CreativeDirection[];
  selectedDirectionId?: string;
  lockedTraits: string[];
  guidancePreference: GuidancePreference;
};

type IntentEntry = { id: string; key: string; index?: number; value: string };

function id() {
  return crypto.randomUUID();
}

function friendlyStatus(status: StudioStatus) {
  return {
    "gathering-context": "Gathering context",
    "clarifying-intent": "Clarifying intent",
    "ready-to-explore": "Ready to explore",
    exploring: "Exploring directions",
    refining: "Refining a direction",
  }[status];
}

function intentEntries(intent: WorkingIntent): IntentEntry[] {
  return Object.entries(intent).flatMap(([key, value]) => {
    if (Array.isArray(value)) return value.map((item, index) => ({ id: `${key}.${index}`, key, index, value: item }));
    return value ? [{ id: key, key, value: String(value) }] : [];
  });
}

async function api<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Something went wrong.");
  return result as T;
}

export function CreativeDirectionStudio() {
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [workingIntent, setWorkingIntent] = useState<WorkingIntent>({});
  const [status, setStatus] = useState<StudioStatus>("gathering-context");
  const [directions, setDirections] = useState<CreativeDirection[]>([]);
  const [selectedDirectionId, setSelectedDirectionId] = useState<string>();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string>();
  const [lockedTraits, setLockedTraits] = useState<string[]>([]);
  const [guidancePreference, setGuidancePreference] = useState<GuidancePreference>("guide");
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>();
  const [contradiction, setContradiction] = useState<IntentUpdateResult["contradiction"]>();
  const [combineIds, setCombineIds] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [leftPanelTab, setLeftPanelTab] = useState<"chat" | "intent">("chat");
  const [hydrated, setHydrated] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Diagnostics>();
  const requestVersion = useRef(0);

  const selectedDirection = directions.find((direction) => direction.id === selectedDirectionId);
  const selectedImage = images.find((image) => image.id === selectedImageId) || selectedDirection?.previewImage;
  const directionImages = selectedDirection
    ? images
    : [];

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as PersistedState;
          setContextItems(stored.contextItems ?? []);
          setConversation(stored.conversation ?? []);
          setWorkingIntent(stored.workingIntent ?? {});
          setDirections((stored.directions ?? []).map((direction) => ({ ...direction, previewImage: undefined, status: direction.status === "rejected" ? "rejected" : "proposed" })));
          setSelectedDirectionId(stored.selectedDirectionId);
          setLockedTraits(stored.lockedTraits ?? []);
          setGuidancePreference(stored.guidancePreference ?? "guide");
          setStatus(stored.selectedDirectionId ? "refining" : stored.directions?.length || stored.workingIntent?.objective || stored.workingIntent?.coreIdea ? "ready-to-explore" : "gathering-context");
        }
      } catch {
        setError("Saved session data could not be restored, so a fresh workspace was opened.");
      } finally {
        setHydrated(true);
      }
    });
    fetch("/api/creative-direction-studio/status").then((response) => response.json()).then((value) => {
      if (!value.error) setDiagnostics(value);
    }).catch(() => undefined);
    trackStudioEvent("experiment_opened");
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const safeDirections = directions.map((direction) => ({ ...direction, previewImage: undefined }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ contextItems, conversation, workingIntent, directions: safeDirections, selectedDirectionId, lockedTraits, guidancePreference } satisfies PersistedState));
    } catch {
      queueMicrotask(() => setError("This browser could not save the session locally. You can continue in this tab."));
    }
  }, [contextItems, conversation, workingIntent, directions, selectedDirectionId, lockedTraits, guidancePreference, hydrated]);

  const generatePreview = useCallback(async (
    direction: CreativeDirection,
    version: number,
    revisionInstruction?: string,
    parentImageId?: string,
  ) => {
    try {
      const result = await api<{ image: GeneratedImage; diagnostics: { activeProvider: string; fallback: boolean; model: string } }>("/api/creative-direction-studio/generate", {
        workingIntent,
        direction,
        lockedTraits,
        revisionInstruction,
        parentImageId,
      });
      if (requestVersion.current !== version) return;
      setDirections((current) => current.map((item) => item.id === direction.id ? { ...item, status: "ready", previewImage: result.image, error: undefined } : item));
      setImages((current) => current.some((image) => image.id === result.image.id) ? current : [...current, result.image]);
      if (selectedDirectionId === direction.id || revisionInstruction) setSelectedImageId(result.image.id);
      if (result.diagnostics.fallback) trackStudioEvent("image_provider_fallback");
      trackStudioEvent("image_generated", { provider: result.diagnostics.activeProvider, model: result.diagnostics.model });
    } catch (reason) {
      if (requestVersion.current !== version) return;
      const message = reason instanceof Error ? reason.message : "Preview generation failed.";
      setDirections((current) => current.map((item) => item.id === direction.id ? { ...item, status: "failed", error: message } : item));
      trackStudioEvent("image_generation_failed");
    }
  }, [lockedTraits, selectedDirectionId, workingIntent]);

  const explore = useCallback(async () => {
    if (!workingIntent.objective && !workingIntent.coreIdea) {
      setError("Add a little context before exploring directions.");
      return;
    }
    const version = ++requestVersion.current;
    setError(undefined);
    setStatus("exploring");
    setIsGenerating(true);
    setSelectedDirectionId(undefined);
    setSelectedImageId(undefined);
    trackStudioEvent("exploration_requested");
    try {
      const result = await api<{ directions: CreativeDirection[] }>("/api/creative-direction-studio/directions", { workingIntent });
      if (requestVersion.current !== version) return;
      const proposed = result.directions.map((direction) => ({ ...direction, status: "generating" as const }));
      setDirections(proposed);
      setConversation((current) => [...current, { id: id(), role: "assistant", content: "I’ve separated the brief into a human, symbolic, and graphic strategy. The previews are now testing whether each thesis holds visually.", createdAt: new Date().toISOString() }]);
      trackStudioEvent("directions_generated", { count: proposed.length });
      await Promise.allSettled(proposed.map((direction) => generatePreview(direction, version)));
      if (requestVersion.current === version) setStatus("ready-to-explore");
    } catch (reason) {
      if (requestVersion.current === version) {
        setError(reason instanceof Error ? reason.message : "Direction generation failed.");
        setStatus("ready-to-explore");
      }
    } finally {
      if (requestVersion.current === version) setIsGenerating(false);
    }
  }, [generatePreview, workingIntent]);

  function selectDirection(direction: CreativeDirection) {
    setSelectedDirectionId(direction.id);
    setSelectedImageId(direction.previewImage?.id);
    setStatus("refining");
    setShowHistory(false);
    setWorkingIntent((current) => ({
      ...current,
      acceptedDecisions: Array.from(new Set([...(current.acceptedDecisions ?? []), `Selected direction: ${direction.title} — ${direction.thesis}`])),
    }));
    trackStudioEvent("direction_selected");
  }

  function rejectDirection(directionId: string) {
    setDirections((current) => current.map((direction) => direction.id === directionId ? { ...direction, status: "rejected" } : direction));
    setWorkingIntent((current) => ({ ...current, rejectedTraits: Array.from(new Set([...(current.rejectedTraits ?? []), `Reject the strategy used by ${directions.find((item) => item.id === directionId)?.title ?? "this direction"}`])) }));
    trackStudioEvent("direction_rejected");
  }

  async function combineDirections(directionIds = combineIds) {
    const parents = directions.filter((direction) => directionIds.includes(direction.id));
    if (parents.length < 2) {
      setError("Choose at least two directions to combine.");
      return;
    }
    const [first, second] = parents;
    const hybrid: CreativeDirection = {
      ...first,
      id: id(),
      title: `${first.title} × ${second.title}`,
      thesis: `Inherit ${first.title}’s core concept and ${second.title}’s visual structure, resolving the tension in favor of the audience and objective.`,
      visualApproach: `${first.visualApproach} The composition and visual language borrow from ${second.title}: ${second.visualApproach}`,
      emotionalEffect: `${first.emotionalEffect} Balanced with the more immediate signal of ${second.title}.`,
      whyItFits: `This hybrid keeps the strongest communicative decision from each parent without averaging them into a generic middle ground.`,
      tradeoffs: [`The hybrid carries more ideas, so hierarchy must stay especially clear.`, ...first.tradeoffs.slice(0, 1)],
      keyDecisions: { ...first.keyDecisions, composition: second.keyDecisions.composition, visualLanguage: second.keyDecisions.visualLanguage },
      previewImage: undefined,
      status: "generating",
      parentDirectionIds: parents.map((parent) => parent.id),
    };
    const version = ++requestVersion.current;
    setDirections((current) => [...current, hybrid]);
    setCombineIds([]);
    setConversation((current) => [...current, { id: id(), role: "assistant", content: `The hybrid takes the conceptual center from ${first.title} and the composition from ${second.title}. Their main conflict is density versus clarity, so the image will let the concept dominate and use the second direction only as visual grammar.`, createdAt: new Date().toISOString() }]);
    trackStudioEvent("directions_combined");
    await generatePreview(hybrid, version);
  }

  async function refine(instruction: string) {
    if (!selectedDirection) return;
    const parentImage = selectedImage;
    const version = ++requestVersion.current;
    setIsGenerating(true);
    setError(undefined);
    setConversation((current) => [...current, { id: id(), role: "assistant", content: `I’ll change only what the instruction requires and preserve ${lockedTraits.length ? lockedTraits.join(", ") : "the direction’s established decisions"}.`, createdAt: new Date().toISOString() }]);
    trackStudioEvent("refinement_requested");
    try {
      const result = await api<{ direction: CreativeDirection }>("/api/creative-direction-studio/refine", { direction: selectedDirection, instruction, lockedTraits });
      if (requestVersion.current !== version) return;
      const revised = { ...result.direction, status: "generating" as const };
      setDirections((current) => [...current, revised]);
      setSelectedDirectionId(revised.id);
      await generatePreview(revised, version, instruction, parentImage?.id);
      setStatus("refining");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The revision failed. Your previous image is unchanged.");
    } finally {
      if (requestVersion.current === version) setIsGenerating(false);
    }
  }

  async function submit(text = draft) {
    const contribution = text.trim();
    if (!contribution || isThinking || isGenerating) return;
    setDraft("");
    setError(undefined);
    const item: ContextItem = { id: id(), type: "text", content: contribution, createdAt: new Date().toISOString() };
    setContextItems((current) => [...current, item]);
    setConversation((current) => [...current, { id: id(), role: "user", content: contribution, createdAt: item.createdAt }]);
    trackStudioEvent("context_added");

    const lower = contribution.toLowerCase();
    if (selectedDirection && status === "refining") {
      await refine(contribution);
      return;
    }
    const ordinal = lower.includes("first") || lower.includes("one") ? 0 : lower.includes("second") || lower.includes("two") ? 1 : lower.includes("third") || lower.includes("three") ? 2 : -1;
    if (directions.length && ordinal >= 0 && containsAction(lower, ["like", "select", "choose", "refine", "use"])) {
      const direction = directions.filter((item) => item.status !== "rejected")[ordinal];
      if (direction) selectDirection(direction);
    }
    if (directions.length && ordinal >= 0 && containsAction(lower, ["reject", "don't", "do not", "hate"])) {
      const direction = directions[ordinal];
      if (direction) rejectDirection(direction.id);
    }
    if (directions.length && containsAction(lower, ["recommend", "which direction"])) {
      setConversation((current) => [...current, { id: id(), role: "assistant", content: `I’d start with ${directions[0].title}. It is the most legible strategy for the current objective, though ${directions[1]?.title} is more distinctive if originality matters more than immediate comprehension.`, createdAt: new Date().toISOString() }]);
    }
    if (directions.length && lower.includes("combine")) {
      const requestedIndexes = [
        containsAction(lower, ["first", "one"]) ? 0 : -1,
        containsAction(lower, ["second", "two"]) ? 1 : -1,
        containsAction(lower, ["third", "three"]) ? 2 : -1,
      ].filter((index) => index >= 0);
      const requestedIds = requestedIndexes.map((index) => directions[index]?.id).filter((value): value is string => Boolean(value));
      if (requestedIds.length >= 2) await combineDirections(requestedIds);
    }

    setIsThinking(true);
    try {
      const result = await api<IntentUpdateResult>("/api/creative-direction-studio/intent", { previousIntent: workingIntent, contribution });
      setWorkingIntent(result.updatedIntent);
      if (!selectedDirectionId) setStatus(result.status);
      setContradiction(result.contradiction);
      setConversation((current) => [...current, { id: id(), role: "assistant", content: result.assistantMessage, createdAt: new Date().toISOString() }]);
      trackStudioEvent("working_intent_updated");
      if (result.contradiction) trackStudioEvent("contradiction_surfaced");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The intent update failed. Your note is still preserved in context.");
    } finally {
      setIsThinking(false);
    }
  }

  function updateIntentEntry(entryKey: string, index: number | undefined, value?: string) {
    setWorkingIntent((current) => {
      const next = structuredClone(current) as Record<string, unknown>;
      if (index === undefined) {
        if (value?.trim()) next[entryKey] = value.trim();
        else delete next[entryKey];
      } else {
        const list = [...((next[entryKey] as string[]) ?? [])];
        if (value?.trim()) list[index] = value.trim();
        else list.splice(index, 1);
        if (list.length) next[entryKey] = list;
        else delete next[entryKey];
      }
      return next as WorkingIntent;
    });
    trackStudioEvent("working_intent_updated");
  }

  function toggleLock(trait: string) {
    const locked = lockedTraits.includes(trait);
    setLockedTraits((current) => locked ? current.filter((item) => item !== trait) : [...current, trait]);
    trackStudioEvent(locked ? "trait_unlocked" : "trait_locked", { trait });
  }

  function startOver() {
    requestVersion.current += 1;
    setContextItems([]);
    setConversation([]);
    setWorkingIntent({});
    setDirections([]);
    setImages([]);
    setSelectedDirectionId(undefined);
    setSelectedImageId(undefined);
    setLockedTraits([]);
    setStatus("gathering-context");
    setError(undefined);
    setContradiction(undefined);
    localStorage.removeItem(STORAGE_KEY);
    trackStudioEvent("session_reset");
  }

  const recentConversation = useMemo(() => conversation.slice(-5), [conversation]);
  const canExplore = Boolean(workingIntent.objective || workingIntent.coreIdea);

  return (
    <main className="min-h-screen bg-[#f3f0ea] text-[#24211d]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f3f0ea]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Back to Viggy's Lab" className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white/50 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"><ArrowLeft className="h-4 w-4" /></Link>
            <div><h1 className="font-display text-lg font-medium sm:text-xl">Creative Direction Studio</h1><p className="text-[11px] text-black/50">Develop the idea before the prompt</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-white/60 px-3 py-1.5 text-xs text-black/55 sm:inline-flex">{friendlyStatus(status)}</span>
            <button onClick={startOver} className="inline-flex h-9 items-center gap-2 rounded-full border border-black/10 bg-white/50 px-3 text-xs font-medium transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"><RotateCcw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Start over</span></button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-5 px-3 py-4 sm:px-6 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-8 lg:py-6">
        <aside className="order-1 min-w-0 space-y-3 lg:sticky lg:top-[77px] lg:self-start">
          <div>
            <div role="tablist" aria-label="Creative direction workspace" className="flex items-end gap-1 border-b border-black/10 px-1">
              <button
                id="chat-tab"
                role="tab"
                aria-selected={leftPanelTab === "chat"}
                aria-controls="chat-panel"
                onClick={() => setLeftPanelTab("chat")}
                className={`relative px-3 pb-2.5 pt-1 text-sm font-semibold transition ${leftPanelTab === "chat" ? "text-[#24211d] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#d85432]" : "text-black/40 hover:text-black/65"}`}
              >
                Chat with AI
              </button>
              <button
                id="intent-tab"
                role="tab"
                aria-selected={leftPanelTab === "intent"}
                aria-controls="intent-panel"
                onClick={() => setLeftPanelTab("intent")}
                className={`relative px-3 pb-2.5 pt-1 text-sm font-semibold transition ${leftPanelTab === "intent" ? "text-[#24211d] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#d85432]" : "text-black/40 hover:text-black/65"}`}
              >
                Edit intent
              </button>
            </div>
            <div className="pt-3">
              {leftPanelTab === "chat" ? (
                <ChatInterface messages={recentConversation} loading={isThinking} draft={draft} setDraft={setDraft} onSubmit={() => submit()} disabled={isThinking || isGenerating} placeholder={selectedDirection ? "Refine this direction…" : "Add an idea, constraint, preference, or reaction…"} />
              ) : (
                <WorkingIntentPanel intent={workingIntent} onUpdate={updateIntentEntry} selectedDirection={selectedDirection} lockedTraits={lockedTraits} onToggleLock={toggleLock} />
              )}
            </div>
          </div>
          {!selectedDirection && <button onClick={explore} disabled={isGenerating || !canExplore} className="group flex w-full items-center justify-between rounded-2xl bg-[#d85432] px-4 py-3.5 text-left text-sm font-semibold text-white shadow-[0_10px_30px_-16px_rgba(216,84,50,.8)] transition hover:bg-[#c74728] disabled:cursor-not-allowed disabled:opacity-40"><span className="inline-flex items-center gap-2">{isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Explore directions</span><ArrowUp className="h-4 w-4 rotate-45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></button>}
          {combineIds.length >= 2 && !selectedDirection && <button onClick={() => combineDirections()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#24211d] px-4 py-3 text-sm font-medium text-white"><Merge className="h-4 w-4" /> Combine {combineIds.length} directions</button>}
          {error && <div role="alert" className="flex items-start gap-2 rounded-2xl border border-[#b4422d]/25 bg-[#fff4ef] p-3 text-sm text-[#8e2e1f]"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><span className="flex-1">{error}</span><button onClick={() => setError(undefined)} aria-label="Dismiss error"><X className="h-4 w-4" /></button></div>}
          {contradiction && <div className="rounded-2xl border border-amber-600/25 bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-[.15em] text-amber-800">Creative tension</p><p className="mt-2 text-sm leading-6">{contradiction.description}</p>{contradiction.options && <div className="mt-3 flex flex-wrap gap-1.5">{contradiction.options.map((option) => <button key={option} onClick={() => submit(option)} className="rounded-full border border-amber-700/20 bg-white px-2.5 py-1 text-xs">{option}</button>)}</div>}</div>}
          {selectedDirection && <GuidanceCard direction={selectedDirection} teach={false} />}
        </aside>

        <section className="order-2 min-w-0 lg:sticky lg:top-[77px] lg:self-start">
          {selectedDirection ? (
            <RefinementCanvas direction={selectedDirection} image={selectedImage} isGenerating={isGenerating || selectedDirection.status === "generating"} onBack={() => { setSelectedDirectionId(undefined); setSelectedImageId(undefined); setStatus("ready-to-explore"); }} onShowPrompt={() => { setShowPrompt((value) => !value); trackStudioEvent("generation_prompt_viewed"); }} showPrompt={showPrompt} onRetry={() => { const version = ++requestVersion.current; setDirections((current) => current.map((item) => item.id === selectedDirection.id ? { ...item, status: "generating" } : item)); void generatePreview(selectedDirection, version); }} />
          ) : directions.length ? (
            <DirectionBoard directions={directions} combineIds={combineIds} onToggleCombine={(directionId) => setCombineIds((current) => current.includes(directionId) ? current.filter((item) => item !== directionId) : [...current, directionId])} onSelect={selectDirection} onReject={rejectDirection} onRetry={(direction) => { const version = ++requestVersion.current; setDirections((current) => current.map((item) => item.id === direction.id ? { ...item, status: "generating", error: undefined } : item)); void generatePreview(direction, version); }} />
          ) : (
            <EmptyCanvas onStarter={submit} />
          )}

          {selectedDirection && directionImages.length > 0 && (
            <section className="mt-3 overflow-hidden rounded-3xl border border-black/10 bg-[#fffdf8]">
              <button onClick={() => setShowHistory((value) => !value)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"><span className="inline-flex items-center gap-2"><History className="h-4 w-4" /> Revision history <span className="text-black/40">{directionImages.length}</span></span><ChevronDown className={`h-4 w-4 transition ${showHistory ? "rotate-180" : ""}`} /></button>
              {showHistory && <div className="grid grid-cols-3 gap-2 border-t border-black/10 p-3 sm:grid-cols-5">{directionImages.map((image) => <button key={image.id} onClick={() => setSelectedImageId(image.id)} className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${selectedImage?.id === image.id ? "border-black" : "border-transparent"}`} aria-label={`Restore revision from ${new Date(image.createdAt).toLocaleTimeString()}`}><Image src={image.url} alt={image.alt} fill unoptimized className="object-cover" /><span className="absolute inset-x-1 bottom-1 rounded bg-black/70 px-1 py-0.5 text-[9px] text-white opacity-0 transition group-hover:opacity-100">Branch here</span></button>)}</div>}
            </section>
          )}
        </section>
      </div>
      {process.env.NODE_ENV === "development" && diagnostics && <DiagnosticsPanel value={diagnostics} />}
    </main>
  );
}

function containsAction(text: string, values: string[]) { return values.some((value) => text.includes(value)); }

function ChatInterface({ messages, loading, draft, setDraft, onSubmit, disabled, placeholder }: { messages: ConversationMessage[]; loading: boolean; draft: string; setDraft: (value: string) => void; onSubmit: () => void; disabled: boolean; placeholder: string }) {
  return <section id="chat-panel" role="tabpanel" aria-labelledby="chat-tab" className="flex h-[clamp(360px,52vh,480px)] flex-col overflow-hidden rounded-3xl border border-black/10 bg-[#fffdf8] shadow-[0_18px_60px_-40px_rgba(0,0,0,.5)]"><div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">{messages.length ? messages.map((message) => <div key={message.id} className={`text-sm leading-6 ${message.role === "user" ? "ml-8 rounded-2xl rounded-br-md bg-[#24211d] px-3.5 py-2.5 text-white" : "mr-5 border-l-2 border-[#d85432] pl-3 text-black/70"}`}><span className={`mb-0.5 block text-[9px] font-semibold uppercase tracking-wider ${message.role === "user" ? "text-white/45" : "text-black/30"}`}>{message.role === "user" ? "You" : "Studio"}</span>{message.content}</div>) : <p className="py-5 text-center text-xs leading-5 text-black/40">Your ideas, reactions, and the studio’s interpretation will stay together here.</p>}{loading && <div role="status" className="flex items-center gap-2 border-l-2 border-[#d85432] pl-3 text-xs text-black/45"><LoaderCircle className="h-3.5 w-3.5 animate-spin" />Interpreting how that changes the intent…</div>}</div><div className="shrink-0 border-t border-black/10 p-2"><label className="sr-only" htmlFor="studio-context">Add context</label><textarea id="studio-context" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSubmit(); } }} placeholder={placeholder} className="min-h-20 w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-black/35" /><div className="flex items-center justify-between px-2 pb-1"><span className="text-[10px] text-black/35">Enter to send · Shift + Enter for a new line</span><button disabled={disabled || !draft.trim()} onClick={onSubmit} className="grid h-9 w-9 place-items-center rounded-full bg-[#24211d] text-white transition hover:scale-105 disabled:opacity-30" aria-label="Add context">{disabled ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}</button></div></div></section>;
}

function EmptyCanvas({ onStarter }: { onStarter: (text: string) => void }) {
  return <div className="flex min-h-[58vh] flex-col justify-between overflow-hidden rounded-[2rem] border border-black/10 bg-[#24211d] p-5 text-white sm:min-h-[72vh] sm:p-8"><div><div className="flex items-center gap-2 text-xs uppercase tracking-[.18em] text-white/45"><Sparkles className="h-4 w-4" /> New exploration</div><h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.04] sm:text-6xl">Bring the half-formed idea.<br /><span className="text-[#e66b49]">We’ll find the visual direction.</span></h2><p className="mt-5 max-w-xl text-sm leading-6 text-white/55 sm:text-base">Start with a feeling, constraint, reference, audience, dislike, or contradiction. No polished prompt required.</p></div><div className="mt-12 grid gap-2 sm:grid-cols-2">{starters.map((starter, index) => <button key={starter} onClick={() => onStarter(starter)} className={`group flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-4 text-left text-sm leading-5 transition hover:border-white/25 hover:bg-white/[.08] ${index === 4 ? "sm:col-span-2" : ""}`}><span>{starter}</span><Plus className="mt-0.5 h-4 w-4 shrink-0 text-white/35 transition group-hover:text-white" /></button>)}</div></div>;
}

function DirectionBoard({ directions, combineIds, onToggleCombine, onSelect, onReject, onRetry }: { directions: CreativeDirection[]; combineIds: string[]; onToggleCombine: (id: string) => void; onSelect: (direction: CreativeDirection) => void; onReject: (id: string) => void; onRetry: (direction: CreativeDirection) => void }) {
  return <div><div className="mb-4 flex items-end justify-between px-1"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-black/45">Direction board</p><h2 className="mt-1 font-display text-3xl">Three ways into the idea</h2></div><p className="hidden max-w-xs text-right text-xs leading-5 text-black/45 sm:block">Different concepts, not palette variations. Select one or mark two to combine.</p></div><div className="grid gap-3 md:grid-cols-3">{directions.map((direction, index) => <article key={direction.id} className={`overflow-hidden rounded-3xl border bg-[#fffdf8] transition ${direction.status === "rejected" ? "border-black/5 opacity-50" : combineIds.includes(direction.id) ? "border-[#d85432] ring-2 ring-[#d85432]/15" : "border-black/10"}`}><div className="relative aspect-[4/3] overflow-hidden bg-[#ded8cf]">{direction.previewImage ? <Image src={direction.previewImage.url} alt={direction.previewImage.alt} fill unoptimized className="object-cover" /> : direction.status === "failed" ? <div className="flex h-full flex-col items-center justify-center gap-2 p-5 text-center"><CircleAlert className="h-5 w-5" /><p className="text-xs">{direction.error}</p><button onClick={() => onRetry(direction)} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium"><RefreshCw className="mr-1 inline h-3 w-3" />Try again</button></div> : <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center"><div className="relative"><div className="h-9 w-9 animate-ping rounded-full bg-[#d85432]/15" /><LoaderCircle className="absolute inset-0 m-auto h-5 w-5 animate-spin text-[#d85432]" /></div><p className="text-xs font-medium">{index === 0 ? "Testing a human-scale composition" : index === 1 ? "Exploring a symbolic approach" : "Building a more graphic direction"}</p></div>}<span className="absolute left-3 top-3 rounded-full bg-[#24211d]/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">0{index + 1}</span></div><div className="p-4"><h3 className="font-display text-2xl leading-tight">{direction.title}</h3><p className="mt-2 text-sm font-medium leading-5">{direction.thesis}</p><details className="group mt-4 border-t border-black/10 pt-3"><summary className="cursor-pointer list-none text-xs font-semibold text-black/45">Approach & rationale <ChevronDown className="float-right h-4 w-4 transition group-open:rotate-180" /></summary><div className="mt-3 space-y-3 text-xs leading-5 text-black/65"><p>{direction.visualApproach}</p><p><strong className="text-black/80">Why it fits:</strong> {direction.whyItFits}</p><p><strong className="text-black/80">Effect:</strong> {direction.emotionalEffect}</p><p className="rounded-xl bg-[#f3f0ea] p-2.5"><strong className="text-black/80">Tradeoff:</strong> {direction.tradeoffs[0]}</p></div></details><div className="mt-4 grid grid-cols-2 gap-1.5"><button onClick={() => onSelect(direction)} disabled={direction.status === "rejected"} className="rounded-xl bg-[#24211d] px-3 py-2 text-xs font-semibold text-white disabled:opacity-30">Select & refine</button><button onClick={() => onToggleCombine(direction.id)} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold">{combineIds.includes(direction.id) ? <><Check className="mr-1 inline h-3 w-3" />Marked</> : <><Merge className="mr-1 inline h-3 w-3" />Combine</>}</button><button onClick={() => onReject(direction.id)} className="col-span-2 rounded-xl px-3 py-2 text-xs text-black/45 hover:bg-black/5"><Trash2 className="mr-1 inline h-3 w-3" />Reject direction</button></div></div></article>)}</div></div>;
}

function RefinementCanvas({ direction, image, isGenerating, onBack, onShowPrompt, showPrompt, onRetry }: { direction: CreativeDirection; image?: GeneratedImage; isGenerating: boolean; onBack: () => void; onShowPrompt: () => void; showPrompt: boolean; onRetry: () => void }) {
  return <div><div className="mb-3 flex items-center justify-between px-1"><button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-medium text-black/55 hover:text-black"><ArrowLeft className="h-3.5 w-3.5" />All directions</button><span className="text-xs text-black/40">{direction.parentDirectionIds?.length ? <><GitBranch className="mr-1 inline h-3 w-3" />Branched revision</> : "Selected direction"}</span></div><div className="overflow-hidden rounded-[2rem] border border-black/10 bg-[#24211d] text-white"><div className="relative aspect-square max-h-[72vh] min-h-[420px] w-full bg-[#161411] sm:aspect-[16/10]">{image ? <Image src={image.url} alt={image.alt} fill unoptimized priority className="object-contain" /> : <div className="grid h-full place-items-center"><LoaderCircle className="h-7 w-7 animate-spin text-white/40" /></div>}{isGenerating && <div className="absolute inset-0 flex items-end bg-black/20 p-5"><div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs backdrop-blur"><LoaderCircle className="h-3.5 w-3.5 animate-spin" />Preserving the previous image while the revision develops</div></div>}{direction.status === "failed" && <button onClick={onRetry} className="absolute inset-x-0 bottom-5 mx-auto w-fit rounded-full bg-white px-4 py-2 text-xs font-medium text-black"><RefreshCw className="mr-1 inline h-3 w-3" />Try generation again</button>}</div><div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:p-6"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/40">{image?.provider === "mock" ? "Mock preview · not AI-generated" : image ? `${image.provider} · ${image.model}` : "Generating"}</p><h2 className="mt-1 font-display text-3xl">{direction.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">{direction.thesis}</p></div><button onClick={onShowPrompt} disabled={!image} className="self-end rounded-full border border-white/15 px-3 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30">{showPrompt ? "Hide" : "Inspect"} compiled prompt</button></div>{showPrompt && image && <pre className="max-h-56 overflow-auto whitespace-pre-wrap border-t border-white/10 bg-black/20 p-5 text-[11px] leading-5 text-white/60">{image.prompt}</pre>}</div></div>;
}

function WorkingIntentPanel({ intent, onUpdate, selectedDirection, lockedTraits, onToggleLock }: { intent: WorkingIntent; onUpdate: (key: string, index: number | undefined, value?: string) => void; selectedDirection?: CreativeDirection; lockedTraits: string[]; onToggleLock: (trait: string) => void }) {
  const entries = intentEntries(intent);
  return <section id="intent-panel" role="tabpanel" aria-labelledby="intent-tab" className="h-[clamp(360px,52vh,480px)] overflow-y-auto rounded-3xl border border-black/10 bg-[#fffdf8] p-4"><div className="flex items-center justify-between"><h2 className="font-display text-xl">What I believe you’re making</h2><Pencil className="h-4 w-4 text-black/30" /></div>{entries.length ? <div className="mt-4 space-y-1.5">{entries.map((entry) => <div key={entry.id} className="group flex items-start gap-2 rounded-xl bg-[#f3f0ea] px-3 py-2"><input defaultValue={entry.value} onBlur={(event) => { if (event.target.value !== entry.value) onUpdate(entry.key, entry.index, event.target.value); }} aria-label={`Edit ${entry.key}`} className="min-w-0 flex-1 bg-transparent text-xs leading-5 outline-none focus:underline" /><button onClick={() => onUpdate(entry.key, entry.index)} aria-label={`Remove ${entry.key}`} className="mt-1 opacity-30 transition hover:opacity-100"><X className="h-3 w-3" /></button></div>)}</div> : <p className="mt-3 text-sm leading-6 text-black/45">Your interpretation will appear here as you add context.</p>}{selectedDirection && <div className="mt-4 border-t border-black/10 pt-4"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-black/40">Lock decisions</p><div className="flex flex-wrap gap-1.5">{lockableTraits.filter((trait) => trait === "requiredText" ? intent.requiredText : selectedDirection.keyDecisions[trait as keyof typeof selectedDirection.keyDecisions]).map((trait) => { const locked = lockedTraits.includes(trait); return <button key={trait} onClick={() => onToggleLock(trait)} aria-pressed={locked} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${locked ? "border-[#d85432] bg-[#fff1ec] text-[#a9361e]" : "border-black/10 text-black/50"}`}>{locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}{trait.replace("visualLanguage", "visual language")}</button>; })}</div></div>}</section>;
}

function GuidanceCard({ direction, teach }: { direction: CreativeDirection; teach: boolean }) { return <section className="rounded-2xl border border-[#d85432]/20 bg-[#fff7f2] p-4"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[#a9361e]"><Lightbulb className="h-4 w-4" />{teach ? "Why this works" : "Creative guidance"}</p><p className="mt-2 text-sm leading-6">{direction.emotionalEffect}</p><p className="mt-3 text-xs leading-5 text-black/55"><strong>Tradeoff:</strong> {direction.tradeoffs[0]}</p></section>; }

function DiagnosticsPanel({ value }: { value: Diagnostics }) { return <details className="fixed bottom-4 right-4 z-[100] w-56 rounded-2xl border border-black/15 bg-[#fffdf8]/95 p-3 text-[10px] text-black/55 shadow-[0_18px_60px_-22px_rgba(0,0,0,.5)] backdrop-blur-xl"><summary className="cursor-pointer font-semibold uppercase tracking-[.12em]">Development status</summary><dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1"><dt>Language</dt><dd>{value.languageProvider}</dd><dt>Image</dt><dd>{value.imageProvider}{value.fallback ? " (fallback)" : ""}</dd><dt>Output</dt><dd>{value.isMock ? "Mock · clearly labeled" : "Real generation"}</dd><dt>Model</dt><dd>{value.model}</dd></dl></details>; }
