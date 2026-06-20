figma.showUI(__html__, {
  width: 460,
  height: 680,
  themeColors: true
});

const MAX_ASSET_EXPORTS = 18;
const MAX_TEXT_SAMPLES = 80;

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

// Default skill name suggested in the UI, derived from the Figma file name.
// The user can shorten or replace it before extracting.
function defaultSkillName() {
  return `${slugify(figma.root.name || "presentation")}-deck-style`;
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
      opacity: paint.opacity == null ? 1 : paint.opacity
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

function inferRole(textNode, slide) {
  const areaTop = textNode.y / Math.max(slide.height, 1);
  const fontSize = typeof textNode.fontSize === "number" ? textNode.fontSize : 0;
  const text = textNode.characters.trim();

  if (fontSize >= 40 || (areaTop < 0.28 && text.length <= 90)) return "title";
  if (fontSize >= 24) return "subtitle";
  if (fontSize <= 14) return "caption";
  return "body";
}

function readFontName(fontName) {
  if (!fontName || fontName === figma.mixed) return "Mixed";
  return `${fontName.family} ${fontName.style}`.trim();
}

function collectSlide(slide, index) {
  const colors = new Map();
  const textSamples = [];
  const warnings = [];
  const vectorCandidates = [];
  let textNodeCount = 0;
  let imageFillCount = 0;

  walk(slide, (node) => {
    if ("fills" in node) {
      for (const paint of getSolidPaints(node.fills)) {
        const key = `${paint.hex}@${round(paint.opacity)}`;
        colors.set(key, { hex: paint.hex, opacity: round(paint.opacity) });
      }

      if (hasImagePaint(node.fills)) {
        imageFillCount += 1;
      }
    }

    if (node.type === "TEXT" && textSamples.length < MAX_TEXT_SAMPLES) {
      textNodeCount += 1;
      textSamples.push({
        role: inferRole(node, slide),
        text: node.characters.trim().slice(0, 220),
        font: readFontName(node.fontName),
        size: typeof node.fontSize === "number" ? round(node.fontSize) : null,
        lineHeight: node.lineHeight === figma.mixed ? "Mixed" : node.lineHeight,
        letterSpacing: node.letterSpacing === figma.mixed ? "Mixed" : node.letterSpacing,
        fills: getSolidPaints(node.fills),
        x: round(node.x),
        y: round(node.y),
        width: round(node.width),
        height: round(node.height),
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
      `${imageFillCount} image fill${imageFillCount === 1 ? "" : "s"} found; V1 exports SVG guidance and may omit raster fidelity.`
    );
  }

  return {
    id: slide.id,
    name: slide.name,
    safeName: slugify(slide.name || `slide-${index + 1}`),
    index: index + 1,
    width: round(slide.width),
    height: round(slide.height),
    x: round(slide.x),
    y: round(slide.y),
    textNodeCount,
    imageFillCount,
    colors: Array.from(colors.values()),
    textSamples,
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

// A 1x1 light-gray PNG used to replace embedded raster images so the exported
// SVGs (and the resulting skill .zip) stay well under Claude's 30MB limit.
const GRAY_PIXEL_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGM4c+YMAATMAmU5mmUsAAAAAElFTkSuQmCC";

// Matches any embedded raster data URI (the base64 payload Figma inlines for
// image fills). Base64 never contains quotes, so we stop at the next quote.
const EMBEDDED_IMAGE_RE = /data:image\/[a-zA-Z0-9.+-]+;base64,[^"')]+/g;

// Replaces embedded raster image data with a tiny gray placeholder pixel.
// Figma renders image fills via <pattern>/<image> referencing inline base64;
// swapping the payload for a 1x1 gray pixel makes those shapes render as gray
// boxes while collapsing potentially multi-MB SVGs down to a few KB.
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
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([hex, count]) => ({ hex, count }));
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
    .slice(0, 16);
}

function inferArchetype(slide) {
  const titleCount = slide.textSamples.filter((sample) => sample.role === "title").length;
  const bodyCount = slide.textSamples.filter((sample) => sample.role === "body").length;
  const captionCount = slide.textSamples.filter((sample) => sample.role === "caption").length;

  if (slide.textNodeCount <= 2 && titleCount > 0) return "Section break / statement slide";
  if (bodyCount >= 4 || captionCount >= 4) return "Dense content / evidence slide";
  if (slide.vectorCandidates.length >= 4) return "Visual system / diagram slide";
  if (titleCount > 0 && bodyCount <= 2) return "Editorial headline slide";
  return "Mixed layout slide";
}

function buildStyleGuide(projectName, slides, assets, skillSlug) {
  const colors = summarizeColors(slides);
  const typography = summarizeTypography(slides);
  const archetypes = slides.map((slide) => ({
    name: slide.name,
    archetype: inferArchetype(slide),
    width: slide.width,
    height: slide.height,
    textCount: slide.textNodeCount,
    colors: slide.colors.slice(0, 6).map((color) => color.hex)
  }));
  const allWarnings = slides.flatMap((slide) => slide.warnings);

  const styleGuide = [
    `# ${projectName} Presentation Style`,
    "",
    "This style guide was generated from selected Figma presentation frames. Use it as visual direction, not as a literal copy request.",
    "",
    "## Core Rules",
    "",
    "- Preserve the source deck's aspect ratio and slide density before adding new decorative elements.",
    "- Reuse the extracted typography hierarchy for title, subtitle, body, caption, and label text.",
    "- Use the color palette below as the dominant palette; introduce new colors only when the content requires distinction.",
    "- Use SVG references in `assets/` for layout, motif, and illustration inspiration.",
    "- Do not create generic centered title/body slides unless the matching source archetype supports that structure.",
    "- Keep raster imagery out of the generated skill for this version; graphics are represented as SVG references only.",
    "",
    "## Palette",
    "",
    colors.length
      ? colors.map((color) => `- ${color.hex} (${color.count} uses)`).join("\n")
      : "- No solid color tokens were detected.",
    "",
    "## Typography",
    "",
    typography.length
      ? typography.map((style) => `- ${style.role}: ${style.font}, ${style.size}px (${style.count} samples)`).join("\n")
      : "- No text styles were detected.",
    "",
    "## Slide Archetypes",
    "",
    archetypes.map((item, index) =>
      `### ${index + 1}. ${item.archetype}\n- Source: ${item.name}\n- Size: ${item.width} x ${item.height}\n- Text nodes: ${item.textCount}\n- Common colors: ${item.colors.join(", ") || "none detected"}`
    ).join("\n\n"),
    "",
    "## SVG References",
    "",
    assets.length
      ? assets.map((asset) => `- \`${asset.path}\`: ${asset.label}`).join("\n")
      : "- No SVG assets were exported.",
    "",
    "## Graphics Constraint",
    "",
    "This V1 skill intentionally treats graphics as SVG references. If a source slide includes raster image fills, describe the image treatment in words rather than embedding or recreating the bitmap.",
    allWarnings.length ? "\n## Extraction Warnings\n\n" + allWarnings.map((warning) => `- ${warning}`).join("\n") : ""
  ].join("\n");

  const skillDescription =
    `Apply the visual language (typography, color, layout archetypes, and SVG graphics) extracted from the ${projectName} Figma deck. ` +
    "Use when creating or revising presentation slides that should match this source deck's style.";

  const skill = [
    "---",
    `name: ${skillSlug}`,
    `description: "${skillDescription.replace(/\n/g, " ").slice(0, 1024).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
    "---",
    "",
    `# ${projectName} Deck Style`,
    "",
    "Use this skill when creating or revising presentation slides that should follow the visual language extracted from the source Figma deck.",
    "",
    "## Required Workflow",
    "",
    "1. Read `references/style-guide.md` before drafting slide content.",
    "2. Use `references/design-tokens.json` for color and typography choices.",
    "3. Choose the nearest source slide archetype before designing each new slide.",
    "4. Refer to SVG files in `assets/` for composition, motif, and graphic treatment.",
    "5. Maintain the source deck's aspect ratio, spacing density, and hierarchy.",
    "6. Avoid default presentation templates, generic gradients, and arbitrary icon styles.",
    "",
    "## Graphics Rule",
    "",
    "Use SVG-style graphics only. Do not introduce raster-photo-dependent layouts unless the user explicitly provides replacement imagery.",
    "",
    "## Output Expectations",
    "",
    "- Slides should feel related to the source deck without copying proprietary text.",
    "- Every slide should have a clear archetype and hierarchy.",
    "- New graphics should be describable as scalable vector shapes or SVG assets."
  ].join("\n");

  return {
    skill,
    styleGuide,
    tokens: {
      generatedAt: new Date().toISOString(),
      source: "Figma to Claude Skill",
      slideCount: slides.length,
      aspectRatios: Array.from(new Set(slides.map((slide) => `${slide.width}:${slide.height}`))),
      colors,
      typography,
      archetypes
    }
  };
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
    message && typeof message.skillName === "string" ? slugify(message.skillName) : "";
  const skillSlug = requestedName || defaultSkillName();

  figma.ui.postMessage({
    type: "analysis-progress",
    current: 0,
    total: selected.length,
    label: "Reading selected frames..."
  });

  const slideData = selected.map(collectSlide);
  const assets = [];
  const files = [];
  let placeholderCount = 0;

  const plannedGraphics = slideData.reduce(
    (sum, slide) => sum + slide.vectorCandidates.length,
    0
  );
  const totalSteps = slideData.length + Math.min(plannedGraphics, MAX_ASSET_EXPORTS);
  let completedSteps = 0;

  const reportProgress = (label) => {
    figma.ui.postMessage({
      type: "analysis-progress",
      current: completedSteps,
      total: totalSteps,
      label
    });
  };

  for (const slide of slideData) {
    const node = selected[slide.index - 1];
    const slidePath = `assets/slides/${String(slide.index).padStart(2, "0")}-${slide.safeName}.svg`;
    reportProgress(`Exporting slide ${slide.index} of ${slideData.length}: ${slide.name}`);
    const { svg, strippedImages } = await exportSvg(node);
    placeholderCount += strippedImages;

    assets.push({
      path: slidePath,
      label: `Full-slide SVG reference for ${slide.name}`
    });
    files.push({
      path: slidePath,
      content: svg,
      mime: "image/svg+xml"
    });

    completedSteps += 1;
    reportProgress(`Exported slide ${slide.index} of ${slideData.length}`);
  }

  let exportedAssetCount = 0;
  for (const slide of slideData) {
    for (const candidate of slide.vectorCandidates) {
      if (exportedAssetCount >= MAX_ASSET_EXPORTS) break;

      try {
        reportProgress(`Exporting graphic ${exportedAssetCount + 1}: ${candidate.name}`);
        const path = `assets/graphics/${String(exportedAssetCount + 1).padStart(2, "0")}-${slugify(candidate.name)}.svg`;
        const { svg, strippedImages } = await exportSvg(candidate);
        placeholderCount += strippedImages;
        exportedAssetCount += 1;
        assets.push({
          path,
          label: `Reusable vector graphic from ${slide.name}: ${candidate.name}`
        });
        files.push({
          path,
          content: svg,
          mime: "image/svg+xml"
        });
        completedSteps += 1;
        reportProgress(`Exported graphic ${exportedAssetCount} of ${Math.min(plannedGraphics, MAX_ASSET_EXPORTS)}`);
      } catch (exportError) {
        // Some nodes cannot be exported independently; the slide SVG still remains useful.
        completedSteps += 1;
      }
    }
  }

  completedSteps = totalSteps;
  reportProgress("Building style guide and tokens...");
  const generated = buildStyleGuide(projectName, slideData, assets, skillSlug);

  const extraWarnings = placeholderCount > 0
    ? [
        `Replaced ${placeholderCount} embedded raster image${placeholderCount === 1 ? "" : "s"} with gray placeholders to keep the skill .zip under Claude's 30MB limit. Treat these as image-placement guidance, not source imagery.`
      ]
    : [];
  const bundle = {
    name: skillSlug,
    files: [
      {
        path: "SKILL.md",
        content: generated.skill,
        mime: "text/markdown"
      },
      {
        path: "references/style-guide.md",
        content: generated.styleGuide,
        mime: "text/markdown"
      },
      {
        path: "references/design-tokens.json",
        content: JSON.stringify(generated.tokens, null, 2),
        mime: "application/json"
      },
      ...files
    ],
    summary: {
      projectName,
      slideCount: slideData.length,
      svgCount: files.length,
      placeholderCount,
      colors: generated.tokens.colors.length,
      typographyStyles: generated.tokens.typography.length,
      warnings: slideData.flatMap((slide) => slide.warnings).concat(extraWarnings)
    }
  };

  figma.ui.postMessage({
    type: "analysis-complete",
    bundle
  });
}

figma.ui.onmessage = async (message) => {
  if (message.type === "request-default-name") {
    figma.ui.postMessage({ type: "default-name", name: defaultSkillName() });
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
