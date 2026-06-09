export type LabLogType = "idea" | "learning" | "reflection" | "progress" | "shipped";

export type LabLogEntry = {
  id: string;
  type: LabLogType;
  date: string; // ISO
  title: string;
  body: string;
  relatedSlug?: string;
};

export const labLog: LabLogEntry[] = [
  {
    id: "log-10",
    type: "shipped",
    date: "2026-02-03",
    title: "Shipped: World Cup Match Explorer",
    body: "Week 5 is live. Embeddings + a clean dataset beat any amount of prompt engineering.",
    relatedSlug: "world-cup-match-explorer",
  },
  {
    id: "log-09",
    type: "learning",
    date: "2026-02-01",
    title: "Embeddings reward great data",
    body: "Two days cleaning the match dataset improved 'feels like' search more than any model swap.",
  },
  {
    id: "log-08",
    type: "reflection",
    date: "2026-01-29",
    title: "Why I'm doing 52 in 52",
    body: "Constraint is the trick. A week is long enough to ship something real and short enough to kill darlings.",
  },
  {
    id: "log-07",
    type: "progress",
    date: "2026-01-27",
    title: "Calisthenics Coach: alpha on TestFlight",
    body: "Five testers walking through the onboarding. The 'what gear do you have?' step is the entire product.",
    relatedSlug: "ai-calisthenics-coach",
  },
  {
    id: "log-06",
    type: "idea",
    date: "2026-01-24",
    title: "What if memory was a UI element?",
    body: "Notebook draft: surface 'what the agent remembers about you' as a visible, editable list. Trust > magic.",
  },
  {
    id: "log-05",
    type: "learning",
    date: "2026-01-22",
    title: "Spatial UI changes what people make",
    body: "Creative Canvas users branch 4x more than chat users on the same prompt. The interface is the intention.",
    relatedSlug: "creative-canvas",
  },
  {
    id: "log-04",
    type: "shipped",
    date: "2026-01-13",
    title: "Shipped: Brewery Marketing Agent",
    body: "First paying user within 48 hours. Human-in-the-loop was the right default.",
    relatedSlug: "brewery-marketing-agent",
  },
  {
    id: "log-03",
    type: "reflection",
    date: "2026-01-10",
    title: "Agents need observability before autonomy",
    body: "I trust the agent more once I can see every step. Trace UI > more capability.",
  },
  {
    id: "log-02",
    type: "idea",
    date: "2026-01-08",
    title: "A daily art habit",
    body: "Almost everyone says they 'should know more art'. Make it 90 seconds a day.",
    relatedSlug: "daily-artist",
  },
  {
    id: "log-01",
    type: "shipped",
    date: "2026-01-06",
    title: "Shipped: Daily Artist (week 1)",
    body: "First experiment is live. The editorial layer was harder than the model.",
    relatedSlug: "daily-artist",
  },
];
