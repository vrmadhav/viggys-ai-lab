# Figma to Claude Skill

Dev-loadable Figma plugin that turns selected presentation frames into a Claude
Skill scaffold.

## MVP behavior

- Reads selected Figma frames, components, or instances as presentation slides.
- If nothing is selected, analyzes top-level frames on the current page.
- Exports every analyzed slide as an SVG reference.
- Exports reusable vector-like graphics as additional SVG assets.
- Extracts solid colors, typography samples, layout archetypes, and warnings.
- Generates:
  - `SKILL.md`
  - `references/style-guide.md`
  - `references/design-tokens.json`
  - `assets/slides/*.svg`
  - `assets/graphics/*.svg`

## Graphics policy

V1 is intentionally SVG-only. The plugin does not try to package raster image
fills into the Claude Skill. If selected frames contain image fills, the
generated style guide flags them and asks Claude to describe the image treatment
instead of depending on embedded bitmaps.

## Install locally

1. Open Figma.
2. Go to **Plugins > Development > Import plugin from manifest**.
3. Select `extensions/figma-to-claude-skill/manifest.json`.
4. Select one or more presentation frames.
5. Run **Figma to Claude Skill**.
6. Download the generated bundle JSON or individual skill files.

## Using the generated skill

Create a skill folder with the generated files:

```text
my-deck-style/
  SKILL.md
  references/
    style-guide.md
    design-tokens.json
  assets/
    slides/
    graphics/
```

Install or import that folder wherever Claude Skills are supported. The skill
uses the source deck as visual direction: typography, color, layout rhythm,
archetypes, and SVG graphic references.

## Next

- Add a real zip writer so the plugin can export a ready-to-install folder.
- Add better archetype classification for agenda, quote, chart, and comparison
  slides.
- Add optional redaction for proprietary text before skill export.
- Add a review screen for editing generated rules before download.
