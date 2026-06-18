const STORAGE_KEY = "aiCostTrackerState";

const DEFAULT_PROJECT = {
  id: "general",
  name: "General"
};

const SUPPORTED_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "claude.ai",
  "firefly.adobe.com",
  "fal.ai"
];

const DEFAULT_OPENAI_PRICE = { input: 0.75, output: 4.5 };

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
  { match: /claude\s+haiku/i, input: 0.8, output: 4 }
];

const els = {
  monthSpend: document.getElementById("monthSpend"),
  monthEntries: document.getElementById("monthEntries"),
  detectStatus: document.getElementById("detectStatus"),
  detectedTool: document.getElementById("detectedTool"),
  detectedModel: document.getElementById("detectedModel"),
  detectedTurns: document.getElementById("detectedTurns"),
  detectedCost: document.getElementById("detectedCost"),
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

function hostMatches(host, pattern) {
  return host === pattern || host.endsWith(`.${pattern}`);
}

function isSupportedUrl(rawUrl) {
  try {
    const url = new URL(rawUrl || "");
    return url.protocol === "https:" &&
      SUPPORTED_HOSTS.some((host) => hostMatches(url.hostname.toLowerCase(), host));
  } catch {
    return false;
  }
}

function shouldUseOpenAiFallback(tool, model) {
  const text = `${tool || ""} ${model || ""}`;
  return /\b(ChatGPT|OpenAI|GPT-|o\d)\b/i.test(text);
}

function getPrice(model, tool) {
  const found = MODEL_PRICES.find((price) => price.match.test(model || ""));
  if (found) return found;
  return shouldUseOpenAiFallback(tool, model) ? DEFAULT_OPENAI_PRICE : null;
}

function estimateCost(inputTokens, outputTokens, model, tool) {
  const price = getPrice(model, tool);
  if (!price) return 0;

  return (Number(inputTokens || 0) / 1_000_000) * price.input +
    (Number(outputTokens || 0) / 1_000_000) * price.output;
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
  els.detectStatus.textContent = hasDetection ? "Detected" : "Manual";
  els.detectStatus.classList.toggle("ready", hasDetection);
  els.detectedTool.textContent = detection?.tool || "-";
  els.detectedModel.textContent = detection?.model || "-";
  els.detectedTurns.textContent = detection
    ? `${detection.userTurns || 0} in / ${detection.assistantTurns || 0} out`
    : "-";
  els.detectedCost.textContent = detection
    ? money(estimateCost(
      detection.inputTokens,
      detection.outputTokens,
      detection.model,
      detection.tool
    ))
    : "$0.00";
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
  const override = els.costInput.value === "" ? null : Number(els.costInput.value);
  const estimatedCostUsd = override ?? estimateCost(inputTokens, outputTokens, model, tool);

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
