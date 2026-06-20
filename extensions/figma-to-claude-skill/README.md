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
6. Click **Download skill .zip** for a ready-to-install folder (or **Download
   bundle JSON** for the raw structured archive).

## Using the generated skill

The `.zip` already contains a single ready-to-install skill folder:

```text
my-deck-deck-style/
  SKILL.md
  references/
    style-guide.md
    design-tokens.json
  assets/
    slides/
    graphics/
```

`SKILL.md` opens with YAML frontmatter (`name` + `description`) so claude.ai,
Desktop, and the CLI can register it. The `name` matches the folder name.

1. Unzip it.
2. Move the folder into `~/.claude/skills/` (all projects) or a project's
   `.claude/skills/`. On claude.ai or Desktop, upload the `.zip` directly via the
   Skills / Capabilities panel.
3. Tell Claude: `Use the my-deck-deck-style skill to design new slides for
   <topic>.`

The skill uses the source deck as visual direction: typography, color, layout
rhythm, archetypes, and SVG graphic references.

## Next

- Add better archetype classification for agenda, quote, chart, and comparison
  slides.
- Add optional redaction for proprietary text before skill export.
- Add a review screen for editing generated rules before download.
