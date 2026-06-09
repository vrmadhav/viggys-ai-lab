// Images live in /public/experiments and are referenced by absolute path.
const dailyArtist = "/experiments/daily-artist.jpg";
const breweryAgent = "/experiments/brewery-marketing-agent.jpg";
const creativeCanvas = "/experiments/creative-canvas.jpg";
const calisthenicsCoach = "/experiments/ai-calisthenics-coach.jpg";
const worldCup = "/experiments/world-cup-match-explorer.jpg";
const brandBrain = "/experiments/brand-brain-prototype.jpg";

export type ExperimentStatus = "Live" | "In Progress" | "Archived";

export type Experiment = {
  id: number;
  week: number;
  slug: string;
  title: string;
  description: string;
  status: ExperimentStatus;
  tags: string[];
  image: string;
  overview: string;
  problem: string;
  screenshots: string[];
  demoUrl?: string;
  sourceUrl?: string;
  techStack: string[];
  buildTime: string;
  challenges: string[];
  lessons: string[];
  weeklyLearning: string;
  publishedAt: string; // ISO date
};

export const experiments: Experiment[] = [
  {
    id: 1,
    week: 1,
    slug: "daily-artist",
    title: "Daily Artist",
    description: "A daily feed that teaches you one artist and their work.",
    status: "Live",
    tags: ["Art", "Education", "AI"],
    image: dailyArtist,
    overview:
      "Daily Artist is a quiet, daily ritual: open the app, meet one artist, read a short essay generated from public sources, and see three representative works. Built to make art history feel like a habit, not a textbook.",
    problem:
      "Art education feels overwhelming. Most people want exposure, not a museum syllabus. The web is dense and the algorithms reward novelty over depth.",
    screenshots: [dailyArtist, dailyArtist],
    demoUrl: "https://daily-artist.example.com",
    sourceUrl: "https://github.com/viggylabs/daily-artist",
    techStack: ["Next.js", "OpenAI", "Wikipedia API", "Vercel"],
    buildTime: "5 days",
    challenges: [
      "Sourcing accurate, copyright-safe images for each artist.",
      "Keeping daily summaries factual without sounding like Wikipedia.",
      "Designing a feed that rewards short, focused sessions.",
    ],
    lessons: [
      "Prompting works best when the source text is curated, not raw.",
      "A small UI with one clear action beats a feature-rich dashboard.",
      "Daily products live or die by their first 7 days.",
    ],
    weeklyLearning:
      "The hardest part of an AI product is not the model — it's the editorial layer. Decide what 'good' looks like before you ship.",
    publishedAt: "2026-01-06",
  },
  {
    id: 2,
    week: 2,
    slug: "brewery-marketing-agent",
    title: "Brewery Marketing Agent",
    description: "An autonomous agent that drafts weekly marketing for craft breweries.",
    status: "Live",
    tags: ["Agents", "Marketing", "SMB"],
    image: breweryAgent,
    overview:
      "A weekly autonomous agent that pulls the brewery's tap list, generates social copy, designs three image variants, and queues posts for review. Built for the small breweries that can't afford a marketing hire.",
    problem:
      "Small breweries have great product and zero bandwidth for marketing. Generic social tools don't speak craft beer.",
    screenshots: [breweryAgent],
    demoUrl: "https://brewery-agent.example.com",
    sourceUrl: "https://github.com/viggylabs/brewery-agent",
    techStack: ["TypeScript", "OpenAI Agents", "Supabase", "Buffer API"],
    buildTime: "9 days",
    challenges: [
      "Tone calibration — beer copy is voicey and brand-specific.",
      "Managing agent runs reliably on a weekly cadence.",
      "Image generation that matches each brewery's visual language.",
    ],
    lessons: [
      "Human-in-the-loop is the right default for agentic marketing.",
      "Per-brand style guides massively improve output quality.",
      "Agents need observability before they need autonomy.",
    ],
    weeklyLearning:
      "Agents are only useful when the work they do is boring and repeatable. The interesting work is still ours.",
    publishedAt: "2026-01-13",
  },
  {
    id: 3,
    week: 3,
    slug: "creative-canvas",
    title: "Creative Canvas",
    description: "An infinite canvas where prompts become composable visual experiments.",
    status: "In Progress",
    tags: ["Generative", "Canvas", "Design"],
    image: creativeCanvas,
    overview:
      "A spatial canvas for thinking visually with AI. Drop a prompt, branch it, remix it, and connect outputs into chains. Less chat, more thinking surface.",
    problem:
      "Chat is a terrible interface for visual exploration. You lose history, branches, and the geometry of thought.",
    screenshots: [creativeCanvas],
    sourceUrl: "https://github.com/viggylabs/creative-canvas",
    techStack: ["React", "tldraw", "Replicate", "Cloudflare Workers"],
    buildTime: "ongoing",
    challenges: [
      "Performance with thousands of nodes on a single canvas.",
      "Designing edges that feel like causality, not clutter.",
      "Latency hiding for slow generation calls.",
    ],
    lessons: [
      "Spatial UI invites exploration that linear UI suppresses.",
      "Optimistic UI is a creativity multiplier.",
    ],
    weeklyLearning:
      "Interface is intention. Change the surface and you change what people make.",
    publishedAt: "2026-01-20",
  },
  {
    id: 4,
    week: 4,
    slug: "ai-calisthenics-coach",
    title: "AI Calisthenics Coach",
    description: "A pocket coach that builds bodyweight programs from your goals and gear.",
    status: "In Progress",
    tags: ["Health", "Mobile", "AI"],
    image: calisthenicsCoach,
    overview:
      "Tell the coach your goal, what you can hang from, and how long you have. It returns a four-week progression with form cues and weekly check-ins.",
    problem:
      "Generic fitness apps assume gyms and gear. Calisthenics is a perfect fit for adaptive, AI-generated programs.",
    screenshots: [calisthenicsCoach],
    techStack: ["Expo", "React Native", "OpenAI", "Supabase"],
    buildTime: "ongoing",
    challenges: [
      "Safety — refusing programs that risk injury.",
      "Mobile-first form factor for in-workout use.",
      "Tracking progression without nagging.",
    ],
    lessons: [
      "AI coaching needs structure, not just text.",
      "Defaults beat configuration for casual users.",
    ],
    weeklyLearning:
      "Constraints make better products. 'No equipment, 20 minutes' is a clearer brief than 'get fit'.",
    publishedAt: "2026-01-27",
  },
  {
    id: 5,
    week: 5,
    slug: "world-cup-match-explorer",
    title: "World Cup Match Explorer",
    description: "Browse every World Cup match through an AI-summarized lens.",
    status: "Live",
    tags: ["Sports", "Data", "Search"],
    image: worldCup,
    overview:
      "Every World Cup match since 1930, with AI-generated summaries, key moments, and similarity search. Ask 'show me matches like Italy vs Brazil 1982' and get a ranked feed.",
    problem:
      "Sports history lives in walls of text and stat tables. There's no exploratory surface.",
    screenshots: [worldCup],
    demoUrl: "https://wc-explorer.example.com",
    sourceUrl: "https://github.com/viggylabs/wc-explorer",
    techStack: ["Next.js", "pgvector", "OpenAI Embeddings", "Postgres"],
    buildTime: "7 days",
    challenges: [
      "Building a clean dataset across 90+ years of matches.",
      "Tuning embeddings so 'feels like' queries actually work.",
      "Surfacing context without overwhelming the page.",
    ],
    lessons: [
      "Embeddings shine on subjective queries.",
      "A great dataset is 80% of the product.",
    ],
    weeklyLearning:
      "If you find yourself fighting the model, fix the data first.",
    publishedAt: "2026-02-03",
  },
  {
    id: 6,
    week: 6,
    slug: "brand-brain-prototype",
    title: "Brand Brain Prototype",
    description: "A living brand memory that learns from every asset you ship.",
    status: "Archived",
    tags: ["Branding", "Memory", "Agents"],
    image: brandBrain,
    overview:
      "Upload your brand guidelines, past campaigns, and tone documents. Brand Brain becomes a queryable memory that judges new work against your real voice.",
    problem:
      "Brand consistency is a memory problem. Style guides are static; teams aren't.",
    screenshots: [brandBrain],
    sourceUrl: "https://github.com/viggylabs/brand-brain",
    techStack: ["TypeScript", "LangChain", "Pinecone", "Anthropic"],
    buildTime: "6 days",
    challenges: [
      "Modeling 'brand voice' as retrievable knowledge.",
      "Critique without being preachy.",
      "Onboarding the first 10 assets quickly.",
    ],
    lessons: [
      "Memory is a feature, not infrastructure.",
      "Critique UIs need a 'why' for every score.",
    ],
    weeklyLearning:
      "Archived this one — promising idea, wrong wedge. The buyer isn't the brand team; it's the agency reviewing work for them.",
    publishedAt: "2026-02-10",
  },
];

export function getExperimentBySlug(slug: string): Experiment | undefined {
  return experiments.find((e) => e.slug === slug);
}
