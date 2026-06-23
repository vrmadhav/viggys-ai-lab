# Viggy's AI Lab Design System

This system translates the Figma Make reference into production patterns for the archive site and shipped source UIs. It should feel warm, editorial, and calm: soft stone surfaces, white elevated panels, rounded cards, serif display type, and restrained motion.

## Tokens

- Colors live in `src/styles/tokens.css` as semantic CSS variables and Tailwind v4 `@theme inline` tokens.
- Core surfaces: `background`, `surface`, `surface-elevated`, `card`, `popover`, `muted`, `accent`, `border`, and `ring`.
- Primary actions use dark ink on light mode and inverted ink on dark mode. Destructive actions use the destructive token only.
- Project accent tokens are `project-orange`, `project-emerald`, `project-blue`, and `project-neutral`; use them for hover rings or small status accents, not full-page themes.
- Radius defaults to `0.625rem`, with `2xl` panels and `3xl` feature cards/modals.
- Shadows are soft elevation tokens: `--shadow-card`, `--shadow-card-hover`, and `--shadow-modal`.

## Typography

- Body/UI font: Inter, with system fallbacks.
- Display font: Fraunces, with Georgia-style fallbacks.
- Use display type for site identity, project titles, modal headings, and editorial app headings.
- Labels are small, uppercase, and spaced, but not overly loud. Body copy should stay relaxed and readable.

## Components

- Buttons keep the shadcn API and use pill-like primary CTAs, soft secondary buttons, quiet ghost buttons, and clear focus rings.
- Cards are white or elevated surfaces with rounded `2xl`/`3xl` corners, soft borders, and restrained shadow.
- Badges are compact rounded labels with soft backgrounds.
- Dialogs use rounded warm surfaces, a soft overlay, and a visible icon close button.
- Project cards use image-led layouts, grayscale-to-color hover, subtle lift, accent hover ring, and persistent status/date metadata.

## Layout Patterns

- The archive page uses a max-width shell, a sticky sidebar on desktop, and a responsive project grid.
- Navigation is sticky, translucent, and warm with a compact brand mark.
- Footers are quiet editorial navigation, not a heavy marketing block.
- Avoid nested cards; repeated items can be cards, while page sections should stay unframed or use simple layout bands.

## Motion

- Use short transitions for hover/focus and slower image transitions for project imagery.
- Hover lift should be subtle, roughly `translateY(-4px)`.
- Respect `prefers-reduced-motion`; transitions should not be required for understanding state.

## Extension And Plugin UIs

- Chrome extension source UI should mirror the same warm surfaces, rounded panels, compact controls, and token naming where possible.
- Figma plugin panels must preserve `--figma-color-*` host variables so they remain native in light/dark Figma themes. Align radius, spacing, hierarchy, and button treatment without replacing host colors.
- Source files are updated in this pass only. Downloadable ZIPs in `public/downloads` must be repackaged separately before release.
