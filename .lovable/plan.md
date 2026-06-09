## Viggy's AI Lab — Build Plan

A living archive for 52 weekly AI experiments. Dark-mode-first, sidebar layout, data-driven from local TS files, with ambient motion and glass accents.

### Stack
- TanStack Start (React 19 + TS + Vite, file-based routing, SSR, Vercel/edge-ready) — functionally equivalent to your Next.js spec
- Tailwind v4 (tokens in `src/styles.css`)
- Framer Motion for ambient motion + card hover
- shadcn/ui primitives (Button, Badge, Input, Card, etc.)
- lucide-react icons

### Design system (tokens in `src/styles.css`)
- Dark by default (force `.dark` on `<html>`)
- Background: deep slate-black with subtle radial gradient
- Accents: soft violet → cyan gradient, glassmorphism surfaces (`backdrop-blur` + translucent borders)
- Typography: Inter (body) + Space Grotesk (display) — large, generous tracking
- Rounded-2xl, generous whitespace, ambient grain/noise overlay

### Information architecture (routes)
```text
src/routes/
  __root.tsx              app shell, fonts, dark mode, sidebar + outlet
  index.tsx               Home: hero + Lab Log + Experiments grid + search/filter
  experiments.index.tsx   Full grid view (same data, no hero)
  experiments.$slug.tsx   Experiment detail page
  about.tsx               Expanded about (optional, sidebar links here)
```

### Layout
- **Sticky header** (in `__root`): "Viggy's Lab" wordmark left; GitHub + Contact buttons right; mobile: collapses
- **Two-column shell**: left sidebar (sticky, ~320px) + main content; mobile stacks sidebar above
- **Sidebar contents**: About blurb, Stats card, Quick Links (GitHub/LinkedIn/X), Current Mission with progress bar (shipped/52)
- **Footer**: tagline, GitHub/Contact/RSS/Newsletter links, copyright

### Data layer (`src/data/`)
- `experiments.ts` — typed array of 6 seed experiments (Daily Artist, Brewery Marketing Agent, Creative Canvas, AI Calisthenics Coach, World Cup Match Explorer, Brand Brain Prototype) with full detail-page fields populated as placeholders
- `labLog.ts` — typed array of timeline entries (idea / learning / reflection / progress)
- `site.ts` — profile, social links, mission target (52)
- `stats.ts` — derived helpers: `shippedCount`, `currentStreak`, `lastUpdated` computed from experiments; `visitors` shown as static placeholder badge

### Experiment type
```ts
type Status = 'Live' | 'In Progress' | 'Archived';
type Experiment = {
  id: number; week: number; slug: string;
  title: string; description: string; status: Status;
  tags: string[]; image: string; coverPrompt?: string;
  overview: string; problem: string; screenshots: string[];
  demoUrl?: string; sourceUrl?: string; techStack: string[];
  buildTime: string; challenges: string[]; lessons: string[];
  weeklyLearning: string; // "What I Learned This Week"
  publishedAt: string;
};
```

### Components (`src/components/`)
- `app-sidebar.tsx`, `app-header.tsx`, `app-footer.tsx`
- `hero.tsx` — animated gradient/aurora background (Framer Motion)
- `lab-log.tsx` + `lab-log-item.tsx` — vertical timeline with type-coded glyphs
- `experiments-grid.tsx`, `experiment-card.tsx` — hover lift + soft glow
- `search-filter.tsx` — search input + tag chips + status pills, drives client filter state via URL search params (`q`, `tag`, `status`)
- `stats-card.tsx`, `mission-progress.tsx`
- `ambient-bg.tsx` — reusable noise/gradient layer

### Pages
1. **Home (`/`)**: Hero (title + subtitle + ambient motion) → Search/Filter bar → Lab Log (left-leaning timeline) → Experiments Grid (3/2/1 cols)
2. **Experiment detail (`/experiments/$slug`)**: Hero image, status/tags row, Overview, Problem Statement, Screenshots gallery, Demo + Source buttons, Tech Stack chips, Build Time, Challenges list, Lessons list, prominent **"What I Learned This Week"** highlight block, prev/next nav
3. **404 + error boundaries** on every route (root `notFoundComponent`, per-route `errorComponent`)

### Search & filter
- State lives in URL via `validateSearch` (`q`, `tags[]`, `status`) so links are shareable; instant client-side filter

### Motion
- Framer Motion: hero aurora drift, card hover lift/glow, Lab Log fade-in-up on scroll, page transitions on outlet

### SEO
- Per-route `head()` with unique title/description/OG; root sets twitter card; experiment detail uses cover as `og:image`

### Cover images
- Generate 6 cover images via the image tool (1024×768, dark/abstract/lab-coded per experiment theme) → `src/assets/experiments/*.jpg`, imported in `experiments.ts`

### Out of scope (for this pass)
- Real visitor analytics (shown as static badge; can wire to Lovable Cloud later)
- Backend/admin for adding experiments (data is edited in `experiments.ts`)
- Working RSS/Newsletter endpoints (links render but are placeholders)

### Build order
1. Tokens + fonts + dark mode in `src/styles.css` + `__root.tsx`
2. Data files (experiments, lab log, site) with 6 seed entries
3. Shell: header, sidebar, footer, ambient background
4. Home: hero + lab log + grid + search/filter
5. Experiment detail route + content blocks
6. Generate cover images, wire in
7. SEO meta, 404/error boundaries, polish motion
