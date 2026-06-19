const STORAGE_KEY = "aiCostTrackerState";

const DEFAULT_PROJECT = {
  id: "general",
  name: "General"
};

const providerConfig = globalThis.AI_COST_TRACKER_PROVIDER_CONFIG;

const DEFAULT_OPENAI_PRICE = { input: 0.75, output: 4.5 };
const DEFAULT_PRICING_NOTE = "Estimate uses provider model pricing or API-equivalent text pricing where available. It is not your exact provider bill.";
const NO_ESTIMATE_NOTE = "No built-in price for this model yet — enter a manual cost to log it.";

const MODEL_PRICES = [
  { match: /gpt-5\.5/i, input: 5, output: 30 },
  { match: /gpt-5\.4 mini/i, input: 0.75, output: 4.5 },
  { match: /gpt-5\.4/i, input: 2.5, output: 15 },
  { match: /gpt-4o-mini/i, input: 0.15, output: 0.6 },
  { match: /gpt-4o/i, input: 2.5, output: 10 },
  { match: /gpt-4\.1-mini/i, input: 0.4, output: 1.6 },
  { match: /gpt-4\.1/i, input: 2, output: 8 },
  { match: /claude\s+(?:fable|mythos)/i, input: 10, output: 50 },
  { match: /claude\s+opus\s+4\.[5-8]/i, input: 5, output: 25 },
  { match: /claude\s+opus/i, input: 15, output: 75 },
  { match: /claude\s+sonnet/i, input: 3, output: 15 },
  { match: /claude\s+haiku\s+4\.5/i, input: 1, output: 5 },
  { match: /claude\s+haiku/i, input: 0.8, output: 4 },
  { match: /gemini\s+3\.5\s+flash/i, input: 1.5, output: 9 },
  { match: /gemini\s+3\.1\s+pro(?:\s+preview)?/i, input: 2, output: 12 },
  { match: /gemini\s+3\.1\s+flash[- ]lite/i, input: 0.25, output: 1.5 },
  { match: /gemini\s+3\.1\s+flash\s+live/i, input: 0.75, output: 4.5 },
  { match: /gemini\s+3\.1\s+flash/i, input: 0.75, output: 4.5 }
];

const FAL_VIDEO_DIMENSIONS = {
  "480p": { width: 854, height: 480 },
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "4k": { width: 3840, height: 2160 }
};

const FAL_DEFAULT_RESOLUTION = "720p";
const FAL_DEFAULT_DURATION_SECONDS = 5;

const els = {
  monthSpend: document.getElementById("monthSpend"),
  monthEntries: document.getElementById("monthEntries"),
  detectStatus: document.getElementById("detectStatus"),
  detectedTool: document.getElementById("detectedTool"),
  detectedModel: document.getElementById("detectedModel"),
  detectedTurns: document.getElementById("detectedTurns"),
  detectedCost: document.getElementById("detectedCost"),
  pricingNote: document.getElementById("pricingNote"),
  projectSelect: document.getElementById("projectSelect"),
  addProjectButton: document.getElementById("addProjectButton"),
  entryForm: document.getElementById("entryForm"),
  toolInput: document.getElementById("toolInput"),
  modelInput: document.getElementById("modelInput"),
  inputTokensInput: document.getElementById("inputTokensInput"),
  outputTokensInput: document.getElementById("outputTokensInput"),
  costInput: document.getElementById("costInput"),
  ratingInput: document.getElementById("ratingInput"),
  noteInput: document.getElementById("noteInput"),
  entriesList: document.getElementById("entriesList"),
  clearButton: document.getElementById("clearButton"),
  exportButton: document.getElementById("exportButton")
};

let appState = {
  projects: [DEFAULT_PROJECT],
  activeProjectId: DEFAULT_PROJECT.id,
  entries: []
};
let detection = null;

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2
  }).format(value || 0);
}

// Unit rates can be sub-cent (e.g. $0.045/second), so keep more precision than
// the 2-decimal dollar formatter used for totals.
function rateMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value || 0);
}

function isSupportedUrl(rawUrl) {
  return Boolean(providerConfig.providerForUrl(rawUrl));
}

function shouldUseOpenAiFallback(tool, model) {
  const text = `${tool || ""} ${model || ""}`;
  return /\b(ChatGPT|OpenAI|GPT-|o\d)\b/i.test(text);
}

function getPrice(model, tool, pricingMode = "api-equivalent") {
  if (pricingMode !== "api-equivalent") return null;

  const found = MODEL_PRICES.find((price) => price.match.test(model || ""));
  if (found) return found;
  return shouldUseOpenAiFallback(tool, model) ? DEFAULT_OPENAI_PRICE : null;
}

function estimateCost(inputTokens, outputTokens, model, tool, pricingMode) {
  const price = getPrice(model, tool, pricingMode);
  if (!price) return 0;

  return (Number(inputTokens || 0) / 1_000_000) * price.input +
    (Number(outputTokens || 0) / 1_000_000) * price.output;
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function falDuration(details, fallback) {
  const explicit = positiveNumber(details?.durationSeconds);
  if (explicit) return { value: explicit, isFallback: false };
  return { value: fallback, isFallback: true };
}

// Pick the advertised price row that matches the detected job settings.
// Options come straight from the model page, so resolution/audio tiers vary by
// model; fall back to a sensible row (and flag the assumption) when a setting
// is not detected on the page.
function selectFalPriceOption(options, details) {
  if (!Array.isArray(options) || !options.length) return null;

  const detectedResolution = String(details?.resolution || "").toLowerCase();
  const detectedAudio = typeof details?.generateAudio === "boolean"
    ? details.generateAudio
    : null;

  let pool = options;
  let resolutionAssumed = false;

  if (options.some((option) => option.resolution)) {
    const matched = detectedResolution
      ? options.filter((option) => option.resolution === detectedResolution)
      : [];

    if (matched.length) {
      pool = matched;
    } else {
      const fallbackResolution =
        options.find((option) => option.resolution === FAL_DEFAULT_RESOLUTION)?.resolution ||
        options.find((option) => option.resolution)?.resolution;
      pool = options.filter((option) => option.resolution === fallbackResolution);
      resolutionAssumed = true;
    }
  }

  let option = pool[0];
  let audioAssumed = false;

  if (pool.some((entry) => entry.audio !== null)) {
    if (detectedAudio !== null) {
      option = pool.find((entry) => entry.audio === detectedAudio) || option;
    } else {
      // Default to the no-audio row when the page exposes both.
      option = pool.find((entry) => entry.audio === false) || option;
      audioAssumed = true;
    }
  }

  return { option, resolutionAssumed, audioAssumed };
}

function estimateFalCost(item) {
  if (!/fal\.ai/i.test(item?.tool || "")) return null;

  const details = item?.usageDetails || {};
  const selection = selectFalPriceOption(details.priceOptions, details);
  if (!selection) return null;

  const { option, resolutionAssumed, audioAssumed } = selection;
  const parts = [];
  let cost = option.price;

  if (option.unit === "second" || option.unit === "minute") {
    const duration = falDuration(details, FAL_DEFAULT_DURATION_SECONDS);
    const seconds = option.unit === "minute" ? duration.value / 60 : duration.value;
    cost = option.price * seconds;
    parts.push(duration.isFallback ? `${duration.value}s default` : `${duration.value}s`);
  } else if (option.unit === "megapixel") {
    const dimensions = FAL_VIDEO_DIMENSIONS[option.resolution || details.resolution];
    const megapixels = dimensions ? (dimensions.width * dimensions.height) / 1_000_000 : 1;
    cost = option.price * megapixels;
    parts.push(`${megapixels.toFixed(2)} MP`);
  }

  if (option.resolution) {
    parts.push(resolutionAssumed ? `${option.resolution} default` : option.resolution);
  }
  if (option.audio !== null) {
    const audioLabel = option.audio ? "audio on" : "audio off";
    parts.push(audioAssumed ? `${audioLabel} default` : audioLabel);
  }

  const rate = `${rateMoney(option.price)}/${option.unit}`;
  const detail = parts.length ? `${parts.join(", ")} at ${rate}` : rate;

  return {
    cost,
    source: "fal-page-pricing",
    note: `Estimated from this model's page pricing: ${detail}.`
  };
}

function estimateItemCost(item) {
  const falEstimate = estimateFalCost(item);
  if (falEstimate) return falEstimate;

  if (!getPrice(item?.model, item?.tool, item?.pricingMode || "api-equivalent")) {
    return null;
  }

  return {
    cost: estimateCost(
      item?.inputTokens,
      item?.outputTokens,
      item?.model,
      item?.tool,
      item?.pricingMode
    ),
    source: "api-equivalent",
    note: item?.pricingNote || DEFAULT_PRICING_NOTE
  };
}

function currentMonthEntries() {
  const now = new Date();
  return appState.entries.filter((entry) => {
    const date = new Date(entry.createdAt);
    return date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth();
  });
}

async function loadState() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  appState = {
    ...appState,
    ...(stored[STORAGE_KEY] || {})
  };

  if (!appState.projects?.length) appState.projects = [DEFAULT_PROJECT];
  if (!appState.activeProjectId) appState.activeProjectId = appState.projects[0].id;
  if (!Array.isArray(appState.entries)) appState.entries = [];
}

async function saveState() {
  await chrome.storage.local.set({ [STORAGE_KEY]: appState });
}

function renderProjects() {
  els.projectSelect.innerHTML = "";

  for (const project of appState.projects) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    option.selected = project.id === appState.activeProjectId;
    els.projectSelect.append(option);
  }
}

function renderSummary() {
  const entries = currentMonthEntries();
  const spend = entries.reduce((sum, entry) => sum + Number(entry.estimatedCostUsd || 0), 0);
  els.monthSpend.textContent = money(spend);
  els.monthEntries.textContent = String(entries.length);
}

function renderEntries() {
  const entries = appState.entries.slice(0, 6);
  els.entriesList.innerHTML = "";

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = "No usage logged yet.";
    els.entriesList.append(empty);
    return;
  }

  for (const entry of entries) {
    const project = appState.projects.find((item) => item.id === entry.projectId);
    const item = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("span");

    item.className = "entry";
    title.textContent = `${entry.tool} · ${money(entry.estimatedCostUsd)}`;
    meta.textContent = `${project?.name || "General"} · ${entry.model || "Unknown model"} · ${entry.rating}`;
    item.append(title, meta);
    els.entriesList.append(item);
  }
}

function renderDetection() {
  const hasDetection = Boolean(detection?.detected);
  const estimate = detection ? estimateItemCost(detection) : null;
  els.detectStatus.textContent = hasDetection ? "Detected" : "Manual";
  els.detectStatus.classList.toggle("ready", hasDetection);
  els.detectedTool.textContent = detection?.tool || "-";
  els.detectedModel.textContent = detection?.model || "-";
  els.detectedTurns.textContent = detection
    ? `${detection.userTurns || 0} in / ${detection.assistantTurns || 0} out`
    : "-";
  const needsManualPrice = hasDetection && !estimate && detection?.pricingMode !== "manual";
  els.detectedCost.textContent = estimate ? money(estimate.cost) : "Manual";
  els.pricingNote.textContent =
    estimate?.note ||
    (needsManualPrice ? NO_ESTIMATE_NOTE : detection?.pricingNote) ||
    DEFAULT_PRICING_NOTE;
}

function prefillForm() {
  if (!detection) return;

  els.toolInput.value = detection.tool || "ChatGPT";
  els.modelInput.value = detection.model || "";
  els.inputTokensInput.value = String(detection.inputTokens || 0);
  els.outputTokensInput.value = String(detection.outputTokens || 0);
}

async function detectActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !isSupportedUrl(tab.url)) {
    detection = null;
    renderDetection();
    return;
  }

  try {
    detection = await chrome.tabs.sendMessage(tab.id, {
      type: "AI_COST_TRACKER_GET_DETECTION"
    });
  } catch {
    detection = null;
  }

  renderDetection();
  prefillForm();
}

function render() {
  renderProjects();
  renderSummary();
  renderEntries();
  renderDetection();
}

function selectedProject() {
  return appState.projects.find((project) => project.id === els.projectSelect.value) ||
    appState.projects[0];
}

els.projectSelect.addEventListener("change", async () => {
  appState.activeProjectId = els.projectSelect.value;
  await saveState();
});

els.addProjectButton.addEventListener("click", async () => {
  const name = prompt("Project name");
  if (!name?.trim()) return;

  const project = {
    id: crypto.randomUUID(),
    name: name.trim()
  };
  appState.projects.push(project);
  appState.activeProjectId = project.id;
  await saveState();
  render();
});

els.entryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const project = selectedProject();
  const inputTokens = Number(els.inputTokensInput.value || 0);
  const outputTokens = Number(els.outputTokensInput.value || 0);
  const model = els.modelInput.value.trim() || detection?.model || "Unknown";
  const tool = els.toolInput.value.trim() || detection?.tool || "AI tool";
  const pricingMode = detection?.pricingMode || "api-equivalent";
  const pricingNote = detection?.pricingNote || "";
  const override = els.costInput.value === "" ? null : Number(els.costInput.value);
  const detectedEstimate = estimateItemCost({
    ...detection,
    inputTokens,
    outputTokens,
    model,
    tool,
    pricingMode
  });
  const estimatedCostUsd = override ?? detectedEstimate?.cost ?? 0;

  const entry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: detection?.detected ? "detected" : "manual",
    projectId: project.id,
    tool,
    model,
    inputTokens,
    outputTokens,
    estimatedCostUsd,
    pricingMode,
    pricingNote,
    usageDetails: detection?.usageDetails || {},
    costSource: override === null ? detectedEstimate?.source || "manual" : "override",
    rating: els.ratingInput.value,
    note: els.noteInput.value.trim(),
    url: detection?.url || "",
    title: detection?.title || ""
  };

  appState.entries.unshift(entry);
  await saveState();
  els.noteInput.value = "";
  els.costInput.value = "";
  render();
});

els.clearButton.addEventListener("click", async () => {
  if (!confirm("Clear all logged usage?")) return;
  appState.entries = [];
  await saveState();
  render();
});

els.exportButton.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(appState, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  if (chrome.downloads?.download) {
    chrome.downloads.download({
      url,
      filename: `ai-cost-tracker-${new Date().toISOString().slice(0, 10)}.json`,
      saveAs: true
    });
    return;
  }

  window.open(url);
});

loadState()
  .then(detectActiveTab)
  .then(render)
  .catch((error) => {
    console.error(error);
    render();
  });
