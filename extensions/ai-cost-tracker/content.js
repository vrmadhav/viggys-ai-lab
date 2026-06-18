const providerConfig = globalThis.AI_COST_TRACKER_PROVIDER_CONFIG;

let activeProvider = providerConfig.providerForLocation();

const state = {
  tool: activeProvider?.tool || "AI tool",
  model: "Unknown",
  pricingMode: "manual",
  pricingNote: "",
  usageDetails: {},
  inputTokens: 0,
  outputTokens: 0,
  userTurns: 0,
  assistantTurns: 0,
  url: location.href,
  title: document.title,
  lastScannedAt: new Date().toISOString()
};

function estimateTokens(text) {
  const normalized = (text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return 0;
  return Math.max(1, Math.ceil(normalized.length / 4));
}

function queryAll(selectors = []) {
  const nodes = [];
  const seen = new Set();

  for (const selector of selectors) {
    try {
      for (const node of document.querySelectorAll(selector)) {
        if (seen.has(node)) continue;
        seen.add(node);
        nodes.push(node);
      }
    } catch {
      // Some selectors are not supported by every Chrome version.
    }
  }

  return nodes;
}

function textFromNode(node) {
  if (node instanceof HTMLInputElement && node.type === "checkbox") {
    return node.checked ? "true" : "false";
  }

  const formValue = "value" in node ? node.value : "";
  return (formValue || node.innerText || node.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}

function textFromSelectors(selectors = []) {
  const texts = [];
  const seen = new Set();

  for (const node of queryAll(selectors)) {
    const text = textFromNode(node);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    texts.push(text);
  }

  return texts;
}

function cleanModelText(text) {
  const normalized = (text || "").replace(/\s+/g, " ").trim();
  if (!normalized || normalized.length > 80) return "";
  return normalized;
}

function firstTextPatternMatch(text, patterns = []) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const model = cleanModelText(match?.[1] || match?.[0]);
    if (model) return model;
  }

  return "";
}

function extractModelFromElementText(text, provider) {
  const normalized = (text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const extracted = firstTextPatternMatch(
    normalized,
    provider?.modelSelectorPatterns || []
  );
  return extracted || cleanModelText(normalized);
}

function detectModel(provider) {
  const urlModel = provider?.modelFromUrl?.();
  if (urlModel) return cleanModelText(urlModel);

  const bodyText = document.body.innerText || "";
  const labeledModel = firstTextPatternMatch(
    bodyText.replace(/\s+/g, " ").trim(),
    provider?.modelLabelPatterns || []
  );
  if (labeledModel) return labeledModel;

  for (const element of queryAll(provider?.modelSelectors)) {
    const text = extractModelFromElementText(textFromNode(element), provider);
    if (text) return text;
  }

  const modelMatch = provider?.modelPattern ? bodyText.match(provider.modelPattern) : null;
  return cleanModelText(modelMatch?.[0]) || provider?.defaultModel || "Unknown";
}

function firstControlValue(selectors = []) {
  for (const node of queryAll(selectors)) {
    const text = textFromNode(node);
    if (text) return text;
  }

  return "";
}

function firstBodyMatch(label, valuePattern) {
  const text = (document.body.innerText || "").replace(/\s+/g, " ").trim();
  const pattern = new RegExp(`\\b${label}\\b\\s*(${valuePattern})(?=\\s|$)`, "i");
  return text.match(pattern)?.[1] || "";
}

function parseDurationSeconds(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized || normalized === "auto") return null;

  const match = normalized.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function parseBooleanValue(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["true", "yes", "on", "1"].includes(normalized)) return true;
  if (["false", "no", "off", "0"].includes(normalized)) return false;
  return null;
}

function detectFalUsageDetails(model) {
  const resolution = (
    firstControlValue([
      '[name="resolution"]',
      '[aria-label*="resolution" i]',
      'button[aria-label*="resolution" i]'
    ]) ||
    firstBodyMatch("Resolution", "480p|720p|1080p|4k")
  ).toLowerCase();
  const durationRaw = firstControlValue([
    '[name="duration"]',
    '[aria-label*="duration" i]',
    'button[aria-label*="duration" i]'
  ]) || firstBodyMatch("Duration", "auto|\\d{1,2}s?");
  const audioRaw = firstControlValue([
    '[name="generate_audio"]',
    '[name="generateAudio"]',
    '[aria-label*="generate audio" i]'
  ]) || firstBodyMatch("Generate Audio", "true|false|yes|no|on|off");
  const aspectRatio = firstControlValue([
    '[name="aspect_ratio"]',
    '[name="aspectRatio"]',
    '[aria-label*="aspect ratio" i]'
  ]) || firstBodyMatch("Aspect Ratio", "auto|21:9|16:9|4:3|1:1|3:4|9:16");

  return {
    endpoint: model || "",
    resolution,
    durationRaw: durationRaw || "",
    durationSeconds: parseDurationSeconds(durationRaw),
    generateAudio: parseBooleanValue(audioRaw),
    aspectRatio: aspectRatio || ""
  };
}

function detectUsageDetails(provider, model) {
  if (provider?.tool === "fal.ai") return detectFalUsageDetails(model);
  return {};
}

function scanConversation() {
  activeProvider = providerConfig.providerForLocation() || activeProvider;
  const provider = activeProvider || {};
  const userTexts = textFromSelectors(provider.userSelectors);
  const promptTexts = userTexts.length ? [] : textFromSelectors(provider.promptSelectors);
  const assistantTexts = textFromSelectors(provider.assistantSelectors);
  const outputTexts = assistantTexts.length ? [] : textFromSelectors(provider.outputSelectors);
  const inputTexts = userTexts.length ? userTexts : promptTexts;
  const responseTexts = assistantTexts.length ? assistantTexts : outputTexts;
  const model = detectModel(provider);

  state.tool = provider.tool || "AI tool";
  state.model = model;
  state.pricingMode = providerConfig.getPricingMode(provider, location.href, model);
  state.pricingNote = providerConfig.getPricingNote(provider, location.href, model);
  state.usageDetails = detectUsageDetails(provider, model);
  state.userTurns = inputTexts.length;
  state.assistantTurns = responseTexts.length;
  state.inputTokens = inputTexts.reduce((sum, text) => sum + estimateTokens(text), 0);
  state.outputTokens = responseTexts.reduce((sum, text) => sum + estimateTokens(text), 0);
  state.url = location.href;
  state.title = document.title;
  state.lastScannedAt = new Date().toISOString();
}

const observer = new MutationObserver(() => {
  window.clearTimeout(window.__aiCostTrackerScanTimer);
  window.__aiCostTrackerScanTimer = window.setTimeout(scanConversation, 500);
});

scanConversation();
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "AI_COST_TRACKER_GET_DETECTION") return false;

  scanConversation();
  sendResponse({
    ...state,
    detected: Boolean(activeProvider)
  });
  return true;
});
