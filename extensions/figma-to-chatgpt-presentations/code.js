figma.showUI(__html__, {
  width: 460,
  height: 700,
  themeColors: true
});

const MAX_TEXT_SAMPLES = 100;
const MAX_REFERENCE_FILES = 14;
const MAX_SLIDE_REFERENCES = 8;
const MAX_GRAPHIC_REFERENCES = 6;

function slugify(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48) || "item";
}

function round(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function defaultKitName() {
  return `${slugify(figma.root.name || "presentation")}-chatgpt-deck-kit`;
}

function paintToHex(paint) {
  if (!paint || paint.type !== "SOLID" || !paint.color) return null;

  const toHex = (channel) => Math.round(channel * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();

  return `#${toHex(paint.color.r)}${toHex(paint.color.g)}${toHex(paint.color.b)}`;
}

function getSolidPaints(paints) {
  if (!Array.isArray(paints)) return [];
  return paints
    .filter((paint) => paint.visible !== false && paint.type === "SOLID")
    .map((paint) => ({
      hex: paintToHex(paint),
      opacity: paint.opacity == null ? 1 : round(paint.opacity)
    }))
    .filter((paint) => paint.hex);
}

function hasImagePaint(paints) {
  return Array.isArray(paints) && paints.some((paint) => paint.type === "IMAGE");
}

function getNodeChildren(node) {
  return "children" in node ? node.children : [];
}

function walk(node, callback) {
  callback(node);
  for (const child of getNodeChildren(node)) walk(child, callback);
}

function getSelectedSlides() {
  const selection = figma.currentPage.selection;

  if (selection.length > 0) {
    return selection.filter((node) => "exportAsync" in node && "width" in node);
  }

  return figma.currentPage.children.filter((node) =>
    node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE"
  );
}

function readFontName(fontName) {
  if (!fontName || fontName === figma.mixed) return "Mixed";
  return `${fontName.family} ${fontName.style}`.trim();
}

function serializeMeasurement(value) {
  if (value === figma.mixed) return "Mixed";
  if (typeof value === "number") return round(value);
  if (value && typeof value === "object") {
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = typeof value[key] === "number" ? round(value[key]) : value[key];
    }
    return result;
  }
  return value == null ? null : value;
}

function getRelativeBounds(node, slide) {
  const nodeBox = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : null;
  const slideBox = "absoluteBoundingBox" in slide ? slide.absoluteBoundingBox : null;

  if (nodeBox && slideBox) {
    return {
      x: round(nodeBox.x - slideBox.x),
      y: round(nodeBox.y - slideBox.y),
      width: round(nodeBox.width),
      height: round(nodeBox.height)
    };
  }

  return {
    x: round("x" in node ? node.x : 0),
    y: round("y" in node ? node.y : 0),
    width: round("width" in node ? node.width : 0),
    height: round("height" in node ? node.height : 0)
  };
}

function inferTextRole(textNode, slide) {
  const bounds = getRelativeBounds(textNode, slide);
  const areaTop = bounds.y / Math.max(slide.height, 1);
  const fontSize = typeof textNode.fontSize === "number" ? textNode.fontSize : 0;
  const text = textNode.characters.trim();

  if (fontSize >= 44 || (areaTop < 0.28 && text.length <= 95)) return "title";
  if (fontSize >= 26) return "subtitle";
  if (fontSize <= 14) return "caption";
  return "body";
}

function collectLayoutSample(node) {
  if (!("layoutMode" in node) || node.layoutMode === "NONE") return null;

  return {
    name: node.name,
    type: node.type,
    layoutMode: node.layoutMode,
    itemSpacing: serializeMeasurement(node.itemSpacing),
    paddingTop: serializeMeasurement(node.paddingTop),
    paddingRight: serializeMeasurement(node.paddingRight),
    paddingBottom: serializeMeasurement(node.paddingBottom),
    paddingLeft: serializeMeasurement(node.paddingLeft)
  };
}

function collectShapeSample(node) {
  const sample = {
    type: node.type,
    cornerRadius: null,
    strokeWeight: null,
    strokes: []
  };

  if ("cornerRadius" in node && node.cornerRadius !== figma.mixed) {
    sample.cornerRadius = round(node.cornerRadius);
  }

  if ("strokeWeight" in node && node.strokeWeight !== figma.mixed) {
    sample.strokeWeight = round(node.strokeWeight);
  }

  if ("strokes" in node) {
    sample.strokes = getSolidPaints(node.strokes);
  }

  if (sample.cornerRadius == null && sample.strokeWeight == null && !sample.strokes.length) {
    return null;
  }

  return sample;
}

function countTextColumns(textSamples, slideWidth) {
  if (textSamples.length < 4 || slideWidth <= 0) return 1;

  const left = textSamples.filter((sample) => sample.x < slideWidth * 0.44).length;
  const right = textSamples.filter((sample) => sample.x > slideWidth * 0.56).length;

  return left >= 2 && right >= 2 ? 2 : 1;
}

function collectSlide(slide, index) {
  const colors = new Map();
  const textSamples = [];
  const layoutSamples = [];
  const shapeSamples = [];
  const warnings = [];
  const vectorCandidates = [];
  let textNodeCount = 0;
  let imageFillCount = 0;
  let nodeCount = 0;

  walk(slide, (node) => {
    nodeCount += 1;

    if ("fills" in node) {
      for (const paint of getSolidPaints(node.fills)) {
        const key = `${paint.hex}@${paint.opacity}`;
        colors.set(key, { hex: paint.hex, opacity: paint.opacity, source: "fill" });
      }

      if (hasImagePaint(node.fills)) {
        imageFillCount += 1;
      }
    }

    if ("strokes" in node) {
      for (const paint of getSolidPaints(node.strokes)) {
        const key = `${paint.hex}@${paint.opacity}`;
        colors.set(key, { hex: paint.hex, opacity: paint.opacity, source: "stroke" });
      }
    }

    const layoutSample = collectLayoutSample(node);
    if (layoutSample && layoutSamples.length < 30) layoutSamples.push(layoutSample);

    const shapeSample = collectShapeSample(node);
    if (shapeSample && shapeSamples.length < 60) shapeSamples.push(shapeSample);

    if (node.type === "TEXT" && textSamples.length < MAX_TEXT_SAMPLES) {
      textNodeCount += 1;
      const bounds = getRelativeBounds(node, slide);
      textSamples.push({
        role: inferTextRole(node, slide),
        text: node.characters.trim().slice(0, 220),
        font: readFontName(node.fontName),
        size: typeof node.fontSize === "number" ? round(node.fontSize) : null,
        lineHeight: serializeMeasurement(node.lineHeight),
        letterSpacing: serializeMeasurement(node.letterSpacing),
        fills: getSolidPaints(node.fills),
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        alignHorizontal: node.textAlignHorizontal,
        alignVertical: node.textAlignVertical
      });
    }

    if (
      node !== slide &&
      "exportAsync" in node &&
      "width" in node &&
      "height" in node &&
      node.visible !== false &&
      node.type !== "TEXT" &&
      node.width >= 24 &&
      node.height >= 24
    ) {
      const fills = "fills" in node ? node.fills : [];
      const likelyGraphic =
        node.type === "VECTOR" ||
        node.type === "BOOLEAN_OPERATION" ||
        node.type === "STAR" ||
        node.type === "POLYGON" ||
        node.type === "ELLIPSE" ||
        node.type === "LINE" ||
        node.type === "COMPONENT" ||
        node.type === "INSTANCE" ||
        node.type === "GROUP" ||
        node.type === "FRAME";

      if (likelyGraphic && !hasImagePaint(fills)) {
        vectorCandidates.push(node);
      }
    }
  });

  if (imageFillCount > 0) {
    warnings.push(
      `${imageFillCount} image fill${imageFillCount === 1 ? "" : "s"} found; V1 records image treatment but does not package raster source images.`
    );
  }

  const columnCount = countTextColumns(textSamples, slide.width);

  return {
    id: slide.id,
    name: slide.name,
    safeName: slugify(slide.name || `slide-${index + 1}`),
    index: index + 1,
    width: round(slide.width),
    height: round(slide.height),
    aspectRatio: `${round(slide.width)}:${round(slide.height)}`,
    nodeCount,
    textNodeCount,
    imageFillCount,
    columnCount,
    colors: Array.from(colors.values()),
    textSamples,
    layoutSamples,
    shapeSamples,
    vectorCandidates,
    warnings
  };
}

function decodeUtf8(bytes) {
  let result = "";
  let i = 0;

  while (i < bytes.length) {
    const byte1 = bytes[i++];

    if (byte1 < 0x80) {
      result += String.fromCharCode(byte1);
    } else if (byte1 >= 0xc0 && byte1 < 0xe0) {
      const byte2 = bytes[i++] & 0x3f;
      result += String.fromCharCode(((byte1 & 0x1f) << 6) | byte2);
    } else if (byte1 >= 0xe0 && byte1 < 0xf0) {
      const byte2 = bytes[i++] & 0x3f;
      const byte3 = bytes[i++] & 0x3f;
      result += String.fromCharCode(((byte1 & 0x0f) << 12) | (byte2 << 6) | byte3);
    } else {
      const byte2 = bytes[i++] & 0x3f;
      const byte3 = bytes[i++] & 0x3f;
      const byte4 = bytes[i++] & 0x3f;
      let codePoint = ((byte1 & 0x07) << 18) | (byte2 << 12) | (byte3 << 6) | byte4;
      codePoint -= 0x10000;
      result += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff));
    }
  }

  return result;
}

const GRAY_PIXEL_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGM4c+YMAATMAmU5mmUsAAAAAElFTkSuQmCC";
const EMBEDDED_IMAGE_RE = /data:image\/[a-zA-Z0-9.+-]+;base64,[^"')]+/g;

function stripEmbeddedImages(svg) {
  let count = 0;
  const cleaned = svg.replace(EMBEDDED_IMAGE_RE, () => {
    count += 1;
    return GRAY_PIXEL_DATA_URI;
  });

  return { svg: cleaned, strippedImages: count };
}

async function exportSvg(node) {
  const bytes = await node.exportAsync({
    format: "SVG",
    svgOutlineText: false,
    svgIdAttribute: true,
    svgSimplifyStroke: true
  });

  return stripEmbeddedImages(decodeUtf8(bytes));
}

function summarizeColors(slides) {
  const counts = new Map();

  for (const slide of slides) {
    for (const color of slide.colors) {
      const key = color.hex;
      const existing = counts.get(key) || { hex: color.hex, count: 0, sources: new Set() };
      existing.count += 1;
      existing.sources.add(color.source);
      counts.set(key, existing);
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 16)
    .map((color) => ({
      hex: color.hex,
      count: color.count,
      sources: Array.from(color.sources)
    }));
}

function summarizeTypography(slides) {
  const styles = new Map();

  for (const slide of slides) {
    for (const sample of slide.textSamples) {
      if (!sample.size) continue;
      const key = `${sample.role}|${sample.font}|${sample.size}`;
      const existing = styles.get(key) || {
        role: sample.role,
        font: sample.font,
        size: sample.size,
        count: 0
      };
      existing.count += 1;
      styles.set(key, existing);
    }
  }

  return Array.from(styles.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 18);
}

function summarizeLayout(slides) {
  const gaps = new Map();
  const paddings = new Map();
  const columns = new Map();

  for (const slide of slides) {
    columns.set(slide.columnCount, (columns.get(slide.columnCount) || 0) + 1);

    for (const layout of slide.layoutSamples) {
      if (typeof layout.itemSpacing === "number") {
        gaps.set(layout.itemSpacing, (gaps.get(layout.itemSpacing) || 0) + 1);
      }

      for (const key of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]) {
        if (typeof layout[key] === "number") {
          paddings.set(layout[key], (paddings.get(layout[key]) || 0) + 1);
        }
      }
    }
  }

  const common = (map) => Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }));

  return {
    commonGaps: common(gaps),
    commonPadding: common(paddings),
    textColumnCounts: common(columns)
  };
}

function summarizeShapes(slides) {
  const radii = new Map();
  const strokes = new Map();

  for (const slide of slides) {
    for (const shape of slide.shapeSamples) {
      if (typeof shape.cornerRadius === "number") {
        radii.set(shape.cornerRadius, (radii.get(shape.cornerRadius) || 0) + 1);
      }
      if (typeof shape.strokeWeight === "number") {
        strokes.set(shape.strokeWeight, (strokes.get(shape.strokeWeight) || 0) + 1);
      }
    }
  }

  const common = (map) => Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }));

  return {
    cornerRadii: common(radii),
    strokeWeights: common(strokes)
  };
}

function inferArchetype(slide) {
  const titleCount = slide.textSamples.filter((sample) => sample.role === "title").length;
  const bodyCount = slide.textSamples.filter((sample) => sample.role === "body").length;
  const captionCount = slide.textSamples.filter((sample) => sample.role === "caption").length;

  if (slide.imageFillCount > 0 && slide.textNodeCount <= 4) return "Image-led slide";
  if (slide.columnCount >= 2 && bodyCount >= 3) return "Comparison / two-column slide";
  if (slide.textNodeCount <= 2 && titleCount > 0) return "Section break / statement slide";
  if (bodyCount >= 5 || captionCount >= 5) return "Dense evidence slide";
  if (slide.vectorCandidates.length >= 4) return "Visual system / process slide";
  if (titleCount > 0 && bodyCount >= 3 && bodyCount <= 6) return "Agenda / overview slide";
  if (titleCount > 0 && bodyCount <= 2) return "Editorial headline slide";
  return "Mixed layout slide";
}

function buildArchetypeData(slides) {
  return slides.map((slide) => ({
    source: slide.name,
    index: slide.index,
    archetype: inferArchetype(slide),
    size: {
      width: slide.width,
      height: slide.height,
      aspectRatio: slide.aspectRatio
    },
    density: {
      nodeCount: slide.nodeCount,
      textNodeCount: slide.textNodeCount,
      imageFillCount: slide.imageFillCount,
      columnCount: slide.columnCount
    },
    commonColors: slide.colors.slice(0, 8).map((color) => color.hex),
    textRoles: slide.textSamples.slice(0, 12).map((sample) => ({
      role: sample.role,
      font: sample.font,
      size: sample.size,
      x: sample.x,
      y: sample.y,
      width: sample.width,
      height: sample.height
    }))
  }));
}

function buildStyleGuide(projectName, slides, assets) {
  const colors = summarizeColors(slides);
  const typography = summarizeTypography(slides);
  const layout = summarizeLayout(slides);
  const shapes = summarizeShapes(slides);
  const archetypes = buildArchetypeData(slides);
  const allWarnings = slides.flatMap((slide) => slide.warnings);

  return [
    `# ${projectName} ChatGPT Presentation Style Guide`,
    "",
    "This guide was generated from selected Figma presentation frames. It is intended for a Custom GPT or a normal ChatGPT conversation that is helping create, revise, or export presentation slides.",
    "",
    "## Core Rules",
    "",
    "- Keep the source deck's aspect ratio, visual density, and hierarchy before adding new decoration.",
    "- Choose a matching slide archetype before drafting each slide.",
    "- Reuse the extracted typography hierarchy for title, subtitle, body, caption, and label text.",
    "- Use the palette below as the dominant palette; introduce new colors only when the content needs distinction.",
    "- Treat SVG references as visual direction for layout, motifs, and graphic style.",
    "- Do not copy proprietary source text into new decks unless the user explicitly asks for it.",
    "- When generating a PPTX, map these rules into editable shapes and text boxes instead of flattening the whole deck into images.",
    "",
    "## Palette",
    "",
    colors.length
      ? colors.map((color) => `- ${color.hex} (${color.count} uses; ${color.sources.join(", ")})`).join("\n")
      : "- No solid color tokens were detected.",
    "",
    "## Typography",
    "",
    typography.length
      ? typography.map((style) => `- ${style.role}: ${style.font}, ${style.size}px (${style.count} samples)`).join("\n")
      : "- No text styles were detected.",
    "",
    "## Layout Rhythm",
    "",
    layout.commonGaps.length
      ? layout.commonGaps.map((gap) => `- Common gap: ${gap.value}px (${gap.count} samples)`).join("\n")
      : "- No auto-layout gap samples were detected.",
    "",
    layout.commonPadding.length
      ? layout.commonPadding.map((padding) => `- Common padding: ${padding.value}px (${padding.count} samples)`).join("\n")
      : "- No auto-layout padding samples were detected.",
    "",
    "## Shape Treatment",
    "",
    shapes.cornerRadii.length
      ? shapes.cornerRadii.map((radius) => `- Corner radius: ${radius.value}px (${radius.count} samples)`).join("\n")
      : "- No corner radius pattern was detected.",
    "",
    shapes.strokeWeights.length
      ? shapes.strokeWeights.map((stroke) => `- Stroke weight: ${stroke.value}px (${stroke.count} samples)`).join("\n")
      : "- No stroke weight pattern was detected.",
    "",
    "## Slide Archetypes",
    "",
    archetypes.map((item) =>
      `### ${item.index}. ${item.archetype}\n- Source: ${item.source}\n- Size: ${item.size.width} x ${item.size.height}\n- Text nodes: ${item.density.textNodeCount}\n- Image fills: ${item.density.imageFillCount}\n- Text columns: ${item.density.columnCount}\n- Common colors: ${item.commonColors.join(", ") || "none detected"}`
    ).join("\n\n"),
    "",
    "## SVG References",
    "",
    assets.length
      ? assets.map((asset) => `- \`${asset.path}\`: ${asset.label}`).join("\n")
      : "- No SVG references were exported.",
    "",
    "## Raster Image Policy",
    "",
    "This V1 kit records image placement and treatment, but it does not package original raster images. If a source slide uses image fills, ChatGPT should describe the image direction and ask for replacement imagery when fidelity matters.",
    allWarnings.length ? "\n## Extraction Warnings\n\n" + allWarnings.map((warning) => `- ${warning}`).join("\n") : ""
  ].join("\n");
}

function buildGptInstructions(projectName, kitSlug) {
  return [
    `# ${projectName} Presentation GPT Instructions`,
    "",
    "You are a presentation design assistant that creates and revises decks in the visual language of the uploaded Figma source deck.",
    "",
    "## Required Knowledge",
    "",
    "Before drafting or editing slides, read these uploaded knowledge files:",
    "",
    "- `presentation-style-guide.md`",
    "- `design-tokens.json`",
    "- `slide-archetypes.json`",
    "- `asset-index.md`",
    "",
    "## Working Method",
    "",
    "1. Identify the user's deck goal, audience, tone, and output format.",
    "2. Choose the closest slide archetype for each slide before writing slide copy.",
    "3. Preserve the source deck's aspect ratio, density, typography hierarchy, color palette, and graphic rhythm.",
    "4. Generate concise slide copy first, then map it into layout instructions.",
    "5. If asked for an editable presentation file, create an editable PPTX with text boxes, shapes, and charts rather than one flattened image per slide.",
    "6. Use the SVG references as style direction for composition and motifs. Do not copy proprietary source text unless the user asks for exact reuse.",
    "7. If the source deck relies on raster imagery, ask for replacement imagery or describe the image treatment clearly.",
    "",
    "## Response Defaults",
    "",
    "- For a new deck, return a slide-by-slide plan before creating the file.",
    "- For a revision, preserve the existing narrative unless the user asks for restructuring.",
    "- For PPTX generation, include speaker notes when useful and keep text editable.",
    "- For visual uncertainty, name the assumption and choose the option closest to the source deck.",
    "",
    "## Starter Invocation",
    "",
    `Use the ${kitSlug} knowledge files to create a presentation in this deck style.`
  ].join("\n");
}

function buildAssetIndex(projectName, assets) {
  return [
    `# ${projectName} Reference Asset Index`,
    "",
    "Upload these SVG files as optional visual references if you have room in the GPT Knowledge file limit. The text knowledge files are higher priority than SVG references.",
    "",
    assets.length
      ? assets.map((asset) => `- \`${asset.path}\` - ${asset.label}`).join("\n")
      : "- No SVG references were exported.",
    "",
    "## Priority",
    "",
    "1. Upload all files in `knowledge/`.",
    "2. Upload the full-slide SVG references that best match the deck you want to create.",
    "3. Upload graphic SVG references only if recurring motifs matter more than full-slide composition."
  ].join("\n");
}

function buildStarterPrompts(projectName, kitSlug) {
  return [
    `# Starter Prompts for ${projectName}`,
    "",
    "## Create a new deck",
    "",
    `Use the ${kitSlug} style knowledge to create a 10-slide presentation about [topic] for [audience]. Start with a slide plan, then create an editable PPTX.`,
    "",
    "## Rewrite an existing deck",
    "",
    `Use the ${kitSlug} style knowledge to revise this deck for clearer executive storytelling while preserving the source visual style.`,
    "",
    "## Generate a single slide",
    "",
    `Create one slide in the ${kitSlug} style for this message: [message]. Pick the best matching archetype and explain the layout before generating the slide.`,
    "",
    "## Convert notes into slides",
    "",
    `Turn these notes into a presentation using the ${kitSlug} visual language. Keep copy concise and include speaker notes.`
  ].join("\n");
}

function buildReadme(projectName, kitSlug, summary) {
  return [
    `# ${projectName} ChatGPT Presentation Kit`,
    "",
    "This folder was generated by the Figma to ChatGPT Presentations plugin.",
    "",
    "## What is inside",
    "",
    "- `gpt-instructions.md`: copy this into the GPT Builder Instructions field.",
    "- `knowledge/`: upload these files as GPT Knowledge.",
    "- `references/`: optional SVG references for slide composition and graphic style.",
    "- `prompts/`: starter prompts for using the kit in ChatGPT.",
    "",
    "## Recommended GPT setup",
    "",
    "1. Create or edit a Custom GPT in ChatGPT.",
    "2. Copy `gpt-instructions.md` into the Instructions field.",
    "3. Upload the files in `knowledge/`.",
    "4. If there is upload room, add selected SVG references from `references/`.",
    "5. Enable Code Interpreter / Data Analysis for editable PPTX generation.",
    "6. Optionally enable Canvas for iterative deck writing and image generation when the deck needs custom imagery.",
    "",
    "## Extraction summary",
    "",
    `- Source slides analyzed: ${summary.slideCount}`,
    `- SVG references exported: ${summary.svgCount}`,
    `- Color tokens: ${summary.colors}`,
    `- Typography styles: ${summary.typographyStyles}`,
    "",
    "## First prompt",
    "",
    `Use the ${kitSlug} knowledge to create a presentation in this style. Start by asking for the topic, audience, desired length, and output format.`
  ].join("\n");
}

function chooseReferenceIndexes(count, maxCount) {
  if (count <= maxCount) {
    return Array.from({ length: count }, (_, index) => index);
  }

  const indexes = new Set();
  for (let i = 0; i < maxCount; i++) {
    indexes.add(Math.round((i * (count - 1)) / (maxCount - 1)));
  }

  return Array.from(indexes).sort((a, b) => a - b);
}

function buildGeneratedFiles(projectName, slides, assets, kitSlug, summary) {
  const styleGuide = buildStyleGuide(projectName, slides, assets);
  const tokens = {
    generatedAt: new Date().toISOString(),
    source: "Figma to ChatGPT Presentations",
    slideCount: slides.length,
    aspectRatios: Array.from(new Set(slides.map((slide) => slide.aspectRatio))),
    colors: summarizeColors(slides),
    typography: summarizeTypography(slides),
    layout: summarizeLayout(slides),
    shapes: summarizeShapes(slides)
  };
  const archetypes = buildArchetypeData(slides);

  return [
    {
      path: "README.md",
      content: buildReadme(projectName, kitSlug, summary),
      mime: "text/markdown"
    },
    {
      path: "gpt-instructions.md",
      content: buildGptInstructions(projectName, kitSlug),
      mime: "text/markdown"
    },
    {
      path: "knowledge/presentation-style-guide.md",
      content: styleGuide,
      mime: "text/markdown"
    },
    {
      path: "knowledge/design-tokens.json",
      content: JSON.stringify(tokens, null, 2),
      mime: "application/json"
    },
    {
      path: "knowledge/slide-archetypes.json",
      content: JSON.stringify(archetypes, null, 2),
      mime: "application/json"
    },
    {
      path: "knowledge/asset-index.md",
      content: buildAssetIndex(projectName, assets),
      mime: "text/markdown"
    },
    {
      path: "prompts/starter-prompts.md",
      content: buildStarterPrompts(projectName, kitSlug),
      mime: "text/markdown"
    }
  ];
}

async function analyzeSelection(message) {
  const selected = getSelectedSlides();

  if (!selected.length) {
    figma.ui.postMessage({
      type: "analysis-error",
      message: "Select one or more presentation frames, or keep the page empty of selection to analyze top-level frames."
    });
    return;
  }

  const projectName = figma.root.name || "Figma Presentation";
  const requestedName =
    message && typeof message.kitName === "string" ? slugify(message.kitName) : "";
  const kitSlug = requestedName || defaultKitName();

  figma.ui.postMessage({
    type: "analysis-progress",
    current: 0,
    total: selected.length,
    label: "Reading selected frames..."
  });

  const slideData = selected.map(collectSlide);
  const slideReferenceIndexes = chooseReferenceIndexes(slideData.length, MAX_SLIDE_REFERENCES);
  const graphicsBudget = Math.min(
    MAX_GRAPHIC_REFERENCES,
    Math.max(0, MAX_REFERENCE_FILES - slideReferenceIndexes.length)
  );
  const plannedGraphics = Math.min(
    slideData.reduce((sum, slide) => sum + slide.vectorCandidates.length, 0),
    graphicsBudget
  );
  const totalSteps = slideReferenceIndexes.length + plannedGraphics;
  const assets = [];
  const assetFiles = [];
  let placeholderCount = 0;
  let completedSteps = 0;

  const reportProgress = (label) => {
    figma.ui.postMessage({
      type: "analysis-progress",
      current: completedSteps,
      total: totalSteps,
      label
    });
  };

  for (const slideIndex of slideReferenceIndexes) {
    const slide = slideData[slideIndex];
    const node = selected[slideIndex];
    const slidePath = `references/slides/${String(slide.index).padStart(2, "0")}-${slide.safeName}.svg`;
    reportProgress(`Exporting slide reference ${slide.index}: ${slide.name}`);
    const { svg, strippedImages } = await exportSvg(node);
    placeholderCount += strippedImages;

    assets.push({
      path: slidePath,
      kind: "slide",
      label: `Full-slide SVG reference for ${slide.name}`
    });
    assetFiles.push({
      path: slidePath,
      content: svg,
      mime: "image/svg+xml"
    });

    completedSteps += 1;
    reportProgress(`Exported slide reference ${slide.index}`);
  }

  let exportedGraphicCount = 0;
  let attemptedGraphicCount = 0;
  for (const slide of slideData) {
    for (const candidate of slide.vectorCandidates) {
      if (attemptedGraphicCount >= graphicsBudget) break;

      try {
        attemptedGraphicCount += 1;
        reportProgress(`Exporting graphic ${attemptedGraphicCount}: ${candidate.name}`);
        const path = `references/graphics/${String(attemptedGraphicCount).padStart(2, "0")}-${slugify(candidate.name)}.svg`;
        const { svg, strippedImages } = await exportSvg(candidate);
        placeholderCount += strippedImages;
        exportedGraphicCount += 1;
        assets.push({
          path,
          kind: "graphic",
          label: `Reusable vector graphic from ${slide.name}: ${candidate.name}`
        });
        assetFiles.push({
          path,
          content: svg,
          mime: "image/svg+xml"
        });
        reportProgress(`Exported graphic ${exportedGraphicCount} of ${graphicsBudget}`);
      } catch {
        // Some nodes cannot be exported independently; full-slide references still capture the visual system.
      } finally {
        completedSteps += 1;
      }
    }
  }

  const extractionWarnings = slideData.flatMap((slide) => slide.warnings);

  if (slideData.length > slideReferenceIndexes.length) {
    extractionWarnings.push(
      `Exported ${slideReferenceIndexes.length} representative slide SVGs from ${slideData.length} analyzed slides to keep the ChatGPT knowledge package manageable.`
    );
  }

  if (placeholderCount > 0) {
    extractionWarnings.push(
      `Replaced ${placeholderCount} embedded raster image${placeholderCount === 1 ? "" : "s"} with gray placeholders inside exported SVG references.`
    );
  }

  const summary = {
    projectName,
    slideCount: slideData.length,
    svgCount: assetFiles.length,
    knowledgeFileCount: 4,
    colors: summarizeColors(slideData).length,
    typographyStyles: summarizeTypography(slideData).length,
    warnings: extractionWarnings
  };

  completedSteps = totalSteps;
  reportProgress("Building ChatGPT instructions and knowledge files...");
  const bundle = {
    name: kitSlug,
    files: [
      ...buildGeneratedFiles(projectName, slideData, assets, kitSlug, summary),
      ...assetFiles
    ],
    summary
  };

  figma.ui.postMessage({
    type: "analysis-complete",
    bundle
  });
}

figma.ui.onmessage = async (message) => {
  if (message.type === "request-default-name") {
    figma.ui.postMessage({ type: "default-name", name: defaultKitName() });
  }

  if (message.type === "analyze-selection") {
    try {
      await analyzeSelection(message);
    } catch (error) {
      figma.ui.postMessage({
        type: "analysis-error",
        message: error instanceof Error ? error.message : "Could not analyze the selected frames."
      });
    }
  }

  if (message.type === "close") {
    figma.closePlugin();
  }
};
