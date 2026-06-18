const state = {
  tool: "ChatGPT",
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

function textFromNodes(nodes) {
  return Array.from(nodes)
    .map((node) => node.innerText || node.textContent || "")
    .filter(Boolean);
}

function detectModel() {
  const candidates = [
    '[data-testid="model-switcher-dropdown-button"]',
    'button[aria-label*="model" i]',
    'button:has([data-testid*="model" i])'
  ];

  for (const selector of candidates) {
    try {
      const element = document.querySelector(selector);
      const text = element?.innerText?.trim();
      if (text) return text.replace(/\s+/g, " ");
    } catch {
      // Some selectors are not supported by every Chrome version.
    }
  }

  const bodyText = document.body.innerText || "";
  const modelMatch = bodyText.match(/\b(GPT-[\w. -]+|o\d(?:-[\w-]+)?|ChatGPT)\b/i);
  return modelMatch?.[0] || "Unknown";
}

function scanConversation() {
  const userTexts = textFromNodes(
    document.querySelectorAll('[data-message-author-role="user"]')
  );
  const assistantTexts = textFromNodes(
    document.querySelectorAll('[data-message-author-role="assistant"]')
  );

  state.model = detectModel();
  state.userTurns = userTexts.length;
  state.assistantTurns = assistantTexts.length;
  state.inputTokens = userTexts.reduce((sum, text) => sum + estimateTokens(text), 0);
  state.outputTokens = assistantTexts.reduce((sum, text) => sum + estimateTokens(text), 0);
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
    detected: state.userTurns > 0 || state.assistantTurns > 0
  });
  return true;
});
