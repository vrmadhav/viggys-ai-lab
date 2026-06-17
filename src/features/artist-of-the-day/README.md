# Artist Of The Day

Mobile-first daily taste-training app for young designers.

## Structure

- `src/app/apps/artist-of-the-day/page.tsx` is the public route.
- `components/` contains app-specific UI.
- `data/` contains seed content and, later, API adapters.
- `types.ts` defines the app domain model.

## Product Intent

The app should feel like a quiet daily ritual, not a course dashboard or image feed.
The first screen should immediately show today's artist and frame the day as one
lesson in seeing.

The product promise is: meet one artist, study three works, and learn how great
creative choices build taste.

## Taste Training

Each artist day should help users move from vague preference to useful language:

- Name the core design principle.
- Separate the weak stylistic takeaway from the better structural takeaway.
- Show three representative works with one focused looking prompt each.
- Invite one personal taste note: what to steal as a principle, not a style.
- Keep the loop complete in a few minutes.

## Build Notes

- Keep the experience mobile-first, with desktop as a polished wider version.
- Start with static seed data before adding external APIs or generation.
- Keep source attribution close to any generated or summarized artist text.
- Prefer one focused daily action over a large browse/search experience in v1.
- Avoid guilt-driven streaks, leaderboards, comments, and social mechanics until the
  core ritual proves useful.
