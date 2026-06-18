const PROVIDERS = [
  {
    tool: "ChatGPT",
    hosts: ["chatgpt.com", "chat.openai.com"],
    defaultModel: "Unknown",
    modelSelectors: [
      '[data-testid="model-switcher-dropdown-button"]',
      'button[aria-label*="model" i]',
      'button:has([data-testid*="model" i])'
    ],
    modelPattern: /\b(GPT-[\w. -]+|o\d(?:-[\w-]+)?|ChatGPT)\b/i,
    userSelectors: ['[data-message-author-role="user"]'],
    assistantSelectors: ['[data-message-author-role="assistant"]'],
    promptSelectors: [
      '#prompt-textarea',
      'textarea[placeholder*="message" i]',
      '[role="textbox"][aria-label*="message" i]',
      '[contenteditable="true"][aria-label*="message" i]'
    ]
  },
  {
    tool: "Claude",
    hosts: ["claude.ai"],
    defaultModel: "Claude",
    modelSelectors: [
      '[data-testid*="model-selector" i]',
      '[data-testid*="model" i]',
      'button[aria-label*="model" i]'
    ],
    modelPattern: /\bClaude\s+(?:Fable|Mythos|Opus|Sonnet|Haiku)[\w. -]*\b/i,
    userSelectors: [
      '[data-testid="user-message"]',
      '[data-testid*="user-message" i]',
      '[data-testid*="human-message" i]',
      '[data-message-author-role="user"]',
      '.font-user-message'
    ],
    assistantSelectors: [
      '[data-testid="assistant-message"]',
      '[data-testid*="assistant-message" i]',
      '[data-testid*="claude-message" i]',
      '[data-message-author-role="assistant"]',
      '.font-claude-message',
      '[data-is-streaming]'
    ],
    promptSelectors: [
      'textarea[placeholder*="message" i]',
      '[role="textbox"][aria-label*="message" i]',
      '[contenteditable="true"][aria-label*="message" i]',
      '[contenteditable="true"]'
    ]
  },
  {
    tool: "Adobe Firefly",
    hosts: ["firefly.adobe.com"],
    defaultModel: "Firefly",
    modelPattern: /\bFirefly(?:\s+(?:Image|Video|Vector|Boards|Sound)[\w. -]*)?\b/i,
    promptSelectors: [
      'textarea[placeholder*="prompt" i]',
      'input[placeholder*="prompt" i]',
      '[role="textbox"][aria-label*="prompt" i]',
      '[contenteditable="true"][aria-label*="prompt" i]',
      '[contenteditable="true"][data-testid*="prompt" i]',
      'textarea'
    ]
  },
  {
    tool: "fal.ai",
    hosts: ["fal.ai"],
    defaultModel: "fal.ai model",
    modelFromUrl() {
      const path = decodeURIComponent(location.pathname);
      const modelMatch = path.match(/\/models\/([^/?#]+\/[^/?#]+)/i) ||
        path.match(/\/models\/([^/?#]+)/i);
      return modelMatch?.[1] || "";
    },
    modelPattern: /\bfal-ai\/[\w.-]+\b/i,
    promptSelectors: [
      'textarea[placeholder*="prompt" i]',
      'input[placeholder*="prompt" i]',
      '[role="textbox"][aria-label*="prompt" i]',
      '[contenteditable="true"][aria-label*="prompt" i]',
      '[contenteditable="true"][data-testid*="prompt" i]',
      'textarea'
    ],
    outputSelectors: [
      '[data-testid*="output" i]',
      '[data-testid*="result" i]',
      '[class*="output" i]',
      '[class*="result" i]',
      'pre'
    ]
  }
];

function hostMatches(host, pattern) {
  return host === pattern || host.endsWith(`.${pattern}`);
}

function detectProvider() {
  const host = location.hostname.toLowerCase();
  return PROVIDERS.find((provider) =>
    provider.hosts.some((pattern) => hostMatches(host, pattern))
  ) || null;
}

let activeProvider = detectProvider();

const state = {
  tool: activeProvider?.tool || "AI tool",
  model: "Unknown",
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

function detectModel(provider) {
  const urlModel = provider?.modelFromUrl?.();
  if (urlModel) return cleanModelText(urlModel);

  for (const element of queryAll(provider?.modelSelectors)) {
    const text = cleanModelText(textFromNode(element));
    if (text) return text;
  }

  const bodyText = document.body.innerText || "";
  const modelMatch = provider?.modelPattern ? bodyText.match(provider.modelPattern) : null;
  return cleanModelText(modelMatch?.[0]) || provider?.defaultModel || "Unknown";
}

function scanConversation() {
  activeProvider = detectProvider() || activeProvider;
  const provider = activeProvider || {};
  const userTexts = textFromSelectors(provider.userSelectors);
  const promptTexts = userTexts.length ? [] : textFromSelectors(provider.promptSelectors);
  const assistantTexts = textFromSelectors(provider.assistantSelectors);
  const outputTexts = assistantTexts.length ? [] : textFromSelectors(provider.outputSelectors);
  const inputTexts = userTexts.length ? userTexts : promptTexts;
  const responseTexts = assistantTexts.length ? assistantTexts : outputTexts;

  state.tool = provider.tool || "AI tool";
  state.model = detectModel(provider);
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
