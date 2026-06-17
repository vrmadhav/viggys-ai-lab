# Artist Of The Day

Mobile-first daily art discovery app.

## Structure

- `src/app/apps/artist-of-the-day/page.tsx` is the public route.
- `components/` contains app-specific UI.
- `data/` contains seed content and, later, API adapters.
- `types.ts` defines the app domain model.

## Product Intent

The app should feel like a quiet daily ritual, not a course dashboard. The first screen
should immediately show today's artist, a concise reason to care, and a small set of
representative works.

## Build Notes

- Keep the experience mobile-first, with desktop as a polished wider version.
- Start with static seed data before adding external APIs or generation.
- Keep source attribution close to any generated or summarized artist text.
- Prefer one focused daily action over a large browse/search experience in v1.
