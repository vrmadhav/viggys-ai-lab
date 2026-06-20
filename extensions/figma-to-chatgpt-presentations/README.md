# Figma to ChatGPT Presentations

Dev-loadable Figma plugin that turns selected presentation frames into a
ChatGPT-ready presentation kit.

## MVP behavior

- Reads selected Figma frames, components, or instances as presentation slides.
- If nothing is selected, analyzes top-level frames on the current page.
- Extracts solid colors, typography samples, layout rhythm, shape treatment,
  slide archetypes, and raster-image warnings.
- Exports a capped set of representative SVG references so the package stays
  practical for GPT Knowledge uploads.
- Generates:
  - `README.md`
  - `gpt-instructions.md`
  - `knowledge/presentation-style-guide.md`
  - `knowledge/design-tokens.json`
  - `knowledge/slide-archetypes.json`
  - `knowledge/asset-index.md`
  - `prompts/starter-prompts.md`
  - `references/slides/*.svg`
  - `references/graphics/*.svg`

## Graphics policy

V1 is text-first and SVG-guided. It records image placement and image-treatment
warnings, but it does not package original raster images. Embedded raster data
inside exported SVG references is replaced with a tiny gray placeholder to keep
the kit small and portable.

## Install locally

1. Open Figma.
2. Go to **Plugins > Development > Import plugin from manifest**.
3. Select `extensions/figma-to-chatgpt-presentations/manifest.json`.
4. Select one or more presentation frames.
5. Run **Figma to ChatGPT Presentations**.
6. Click **Download GPT kit .zip**.

## Using the generated kit in ChatGPT

The `.zip` contains one folder:

```text
my-deck-chatgpt-kit/
  README.md
  gpt-instructions.md
  knowledge/
  references/
  prompts/
```

Recommended setup:

1. Create or edit a Custom GPT in ChatGPT.
2. Copy `gpt-instructions.md` into the Instructions field.
3. Upload the files in `knowledge/`.
4. Upload selected SVG files from `references/` if there is room.
5. Enable Code Interpreter / Data Analysis when you want editable PPTX output.
6. Start from a prompt in `prompts/starter-prompts.md`.

## Next

- Add an editing screen for pruning references before download.
- Add a one-file pasteable prompt mode for normal ChatGPT conversations.
- Add stronger archetype detection for quote, chart, timeline, and comparison
  slides.
