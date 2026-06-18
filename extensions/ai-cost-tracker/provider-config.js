(() => {
  const MANUAL_CREDIT_NOTE = "Credit/subscription pricing; use cost override.";
  const MANUAL_PROVIDER_NOTE = "Provider billing varies; use cost override.";

  const MESSAGE_PROMPT_SELECTORS = [
    'textarea[placeholder*="message" i]',
    'textarea[placeholder*="prompt" i]',
    'input[placeholder*="prompt" i]',
    '[role="textbox"][aria-label*="message" i]',
    '[role="textbox"][aria-label*="prompt" i]',
    '[role="textbox"]',
    '[contenteditable="true"][aria-label*="message" i]',
    '[contenteditable="true"][aria-label*="prompt" i]',
    '[contenteditable="true"][data-testid*="prompt" i]',
    'textarea'
  ];

  function falModelFromUrl() {
    const path = decodeURIComponent(location.pathname);
    const modelMatch = path.match(/\/models\/([^?#]+)/i);
    return (modelMatch?.[1] || "")
      .replace(/\/(?:api|schema|examples|llms|playground)$/i, "")
      .replace(/\/$/, "");
  }

  function googlePricingModeFromUrl(url) {
    return url.hostname.toLowerCase() === "gemini.google.com"
      ? "api-equivalent"
      : "manual";
  }

  function googlePricingNoteFromUrl(url) {
    return googlePricingModeFromUrl(url) === "api-equivalent"
      ? "Gemini text models use API-equivalent pricing when the model is detected."
      : MANUAL_CREDIT_NOTE;
  }

  const FIREFLY_MODEL_NAMES = [
    "Kling(?:\\s*\\d(?:\\.\\d+)?)?",
    "Firefly(?:\\s+(?:Image|Video|Vector|Boards|Sound)(?:\\s+Model)?)?",
    "Veo\\s*\\d(?:\\.\\d+)?",
    "Seedance\\s*\\d(?:\\.\\d+)?",
    "Pika(?:\\s*\\d(?:\\.\\d+)?)?",
    "Luma(?:\\s+(?:Ray|Dream Machine))?(?:\\s*\\d(?:\\.\\d+)?)?"
  ].join("|");
  const FIREFLY_MODEL_PATTERN = new RegExp(`\\b(${FIREFLY_MODEL_NAMES})\\b`, "i");
  const FIREFLY_MODEL_LABEL_PATTERN = new RegExp(
    `\\bModel\\s+(${FIREFLY_MODEL_NAMES})(?=(?:\\s+` +
      "(?:Resolution|Aspect ratio|Frames per second|Duration|Audio|Frames|" +
      "Advanced settings|Seed)|$))",
    "i"
  );

  const PROVIDERS = [
    {
      tool: "ChatGPT",
      hosts: ["chatgpt.com", "chat.openai.com"],
      defaultModel: "Unknown",
      pricingMode: "api-equivalent",
      pricingNote: "OpenAI text models use API-equivalent pricing when the model is detected.",
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
        ...MESSAGE_PROMPT_SELECTORS
      ]
    },
    {
      tool: "Claude",
      hosts: ["claude.ai"],
      defaultModel: "Claude",
      pricingMode: "api-equivalent",
      pricingNote: "Claude text models use API-equivalent pricing when the model is detected.",
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
        ...MESSAGE_PROMPT_SELECTORS,
        '[contenteditable="true"]'
      ]
    },
    {
      tool: "Adobe Firefly",
      hosts: ["firefly.adobe.com"],
      defaultModel: "Firefly",
      pricingMode: "manual",
      pricingNote: MANUAL_CREDIT_NOTE,
      modelSelectors: [
        '[data-testid*="model" i]',
        '[aria-label*="model" i]',
        '[aria-labelledby*="model" i]'
      ],
      modelSelectorPatterns: [FIREFLY_MODEL_PATTERN],
      modelLabelPatterns: [FIREFLY_MODEL_LABEL_PATTERN],
      modelPattern: FIREFLY_MODEL_PATTERN,
      promptSelectors: MESSAGE_PROMPT_SELECTORS
    },
    {
      tool: "fal.ai",
      hosts: ["fal.ai"],
      defaultModel: "fal.ai model",
      pricingMode: "model-estimate",
      pricingNote: "fal model pricing estimate; override if job settings differ.",
      modelFromUrl: falModelFromUrl,
      modelPattern: /\b(?:fal-ai|bytedance)\/[\w.-]+(?:\/[\w.-]+)*\b/i,
      promptSelectors: MESSAGE_PROMPT_SELECTORS,
      outputSelectors: [
        '[data-testid*="output" i]',
        '[data-testid*="result" i]',
        '[class*="output" i]',
        '[class*="result" i]',
        'pre'
      ]
    },
    {
      tool: "Google AI",
      hosts: ["gemini.google.com", "flow.google", "labs.google"],
      pathsByHost: {
        "labs.google": [/^\/fx\/tools\/flow(?:\/|$)/i]
      },
      defaultModel: "Google AI",
      pricingModeFromUrl: googlePricingModeFromUrl,
      pricingNoteFromUrl: googlePricingNoteFromUrl,
      manualModelPattern: /\b(Nano Banana|Veo|Imagen|Lyria|Omni|Image)\b/i,
      modelSelectors: [
        '[data-testid*="model" i]',
        '[aria-label*="model" i]',
        'button[aria-label*="Gemini" i]',
        'button[aria-label*="Veo" i]'
      ],
      modelPattern: /\b(Gemini(?:\s+(?:3\.5|3\.1|3|2\.5)?\s*(?:Pro|Flash(?:-Lite)?|Live|Omni)?(?:\s+Preview)?)?|Nano Banana(?:\s+(?:Pro|\d+))?|Veo\s*\d(?:\.\d)?|Imagen\s*\d|Lyria\s*\d|Omni(?:\s+Flash)?)\b/i,
      userSelectors: [
        '[data-testid*="user-message" i]',
        '[data-testid*="user-query" i]',
        '[class*="user-query" i]',
        '[class*="query-text" i]',
        '[data-message-author-role="user"]'
      ],
      assistantSelectors: [
        '[data-testid*="model-response" i]',
        '[data-testid*="assistant-message" i]',
        '[data-testid*="response" i]',
        '[class*="model-response" i]',
        '[class*="response-content" i]',
        '[data-message-author-role="assistant"]',
        'message-content'
      ],
      promptSelectors: [
        'rich-textarea textarea',
        'textarea[aria-label*="enter a prompt" i]',
        'textarea[placeholder*="ask" i]',
        ...MESSAGE_PROMPT_SELECTORS,
        '[contenteditable="true"]'
      ],
      outputSelectors: [
        '[data-testid*="result" i]',
        '[data-testid*="output" i]',
        '[class*="result" i]',
        '[class*="output" i]'
      ]
    },
    {
      tool: "Canva AI",
      hosts: ["canva.com", "www.canva.com"],
      defaultModel: "Canva AI",
      pricingMode: "manual",
      pricingNote: MANUAL_CREDIT_NOTE,
      modelPattern: /\b(Canva AI|Magic Write|Magic Media|Magic Design|Magic Animate|Magic Studio)\b/i,
      userSelectors: [
        '[data-testid*="user-message" i]',
        '[data-testid*="prompt" i]',
        '[class*="prompt" i]'
      ],
      assistantSelectors: [
        '[data-testid*="assistant-message" i]',
        '[data-testid*="result" i]',
        '[class*="result" i]',
        '[class*="response" i]'
      ],
      promptSelectors: [
        ...MESSAGE_PROMPT_SELECTORS,
        '[aria-label*="Canva AI" i]',
        '[aria-label*="Magic" i]',
        '[contenteditable="true"]'
      ],
      outputSelectors: [
        '[data-testid*="result" i]',
        '[data-testid*="output" i]',
        '[class*="result" i]'
      ]
    },
    {
      tool: "Midjourney",
      hosts: ["midjourney.com", "www.midjourney.com"],
      defaultModel: "Midjourney",
      pricingMode: "manual",
      pricingNote: "Subscription/GPU-time pricing; use cost override.",
      modelPattern: /\b(Midjourney|Niji|V\d+(?:\.\d+)?)\b/i,
      promptSelectors: [
        'textarea[placeholder*="imagine" i]',
        'input[placeholder*="imagine" i]',
        '[aria-label*="Imagine" i]',
        ...MESSAGE_PROMPT_SELECTORS,
        '[contenteditable="true"]'
      ],
      outputSelectors: [
        '[data-testid*="job" i]',
        '[data-testid*="image" i]',
        '[class*="job" i]',
        '[class*="result" i]'
      ]
    },
    {
      tool: "Runway",
      hosts: ["runwayml.com", "app.runwayml.com"],
      defaultModel: "Runway",
      pricingMode: "manual",
      pricingNote: MANUAL_CREDIT_NOTE,
      modelSelectors: [
        '[data-testid*="model" i]',
        '[aria-label*="model" i]',
        '[class*="model" i]'
      ],
      modelPattern: /\b(Gen-4\.5|Gen-4|Gen-3(?:\s+Alpha)?|Veo\s*\d(?:\.\d)?|FLUX(?:\.\d)?|Kling\s*\d(?:\.\d)?|Seedance\s*\d(?:\.\d)?|Runway)\b/i,
      promptSelectors: [
        'textarea[placeholder*="describe" i]',
        'textarea[placeholder*="prompt" i]',
        'textarea[aria-label*="prompt" i]',
        ...MESSAGE_PROMPT_SELECTORS,
        '[contenteditable="true"]'
      ],
      outputSelectors: [
        '[data-testid*="generation" i]',
        '[data-testid*="asset" i]',
        '[data-testid*="output" i]',
        '[class*="generation" i]',
        '[class*="output" i]',
        'video'
      ]
    },
    {
      tool: "Meta AI",
      hosts: ["meta.ai", "www.meta.ai", "ai.meta.com"],
      defaultModel: "Meta AI",
      pricingMode: "manual",
      pricingNote: MANUAL_PROVIDER_NOTE,
      modelPattern: /\b(Meta AI|Llama\s*\d(?:\.\d)?|Imagine|Vibes)\b/i,
      userSelectors: [
        '[data-testid*="user-message" i]',
        '[data-testid*="prompt" i]',
        '[data-message-author-role="user"]'
      ],
      assistantSelectors: [
        '[data-testid*="assistant-message" i]',
        '[data-testid*="response" i]',
        '[data-message-author-role="assistant"]'
      ],
      promptSelectors: [
        ...MESSAGE_PROMPT_SELECTORS,
        '[contenteditable="true"]'
      ],
      outputSelectors: [
        '[data-testid*="response" i]',
        '[data-testid*="result" i]',
        '[class*="response" i]',
        '[class*="result" i]'
      ]
    }
  ];

  function hostMatches(host, pattern) {
    return host === pattern || host.endsWith(`.${pattern}`);
  }

  function pathMatches(url, provider) {
    const patterns = provider.pathsByHost?.[url.hostname.toLowerCase()];
    if (!patterns) return true;
    return patterns.some((pattern) => pattern.test(url.pathname));
  }

  function providerForUrl(rawUrl) {
    let url;

    try {
      url = rawUrl instanceof URL ? rawUrl : new URL(rawUrl || "");
    } catch {
      return null;
    }

    if (url.protocol !== "https:") return null;

    return PROVIDERS.find((provider) =>
      provider.hosts.some((pattern) => hostMatches(url.hostname.toLowerCase(), pattern)) &&
      pathMatches(url, provider)
    ) || null;
  }

  function providerForLocation() {
    return providerForUrl(location.href);
  }

  function getPricingMode(provider, rawUrl, model) {
    if (!provider) return "manual";

    try {
      const url = rawUrl instanceof URL ? rawUrl : new URL(rawUrl || location.href);
      const pricingMode = provider.pricingModeFromUrl?.(url) || provider.pricingMode || "manual";
      if (pricingMode === "api-equivalent" && provider.manualModelPattern?.test(model || "")) {
        return "manual";
      }

      return pricingMode;
    } catch {
      return provider.pricingMode || "manual";
    }
  }

  function getPricingNote(provider, rawUrl, model) {
    if (!provider) return MANUAL_PROVIDER_NOTE;

    try {
      const url = rawUrl instanceof URL ? rawUrl : new URL(rawUrl || location.href);
      if (provider.manualModelPattern?.test(model || "")) return MANUAL_CREDIT_NOTE;
      return provider.pricingNoteFromUrl?.(url) || provider.pricingNote || "";
    } catch {
      return provider.pricingNote || "";
    }
  }

  globalThis.AI_COST_TRACKER_PROVIDER_CONFIG = {
    providers: PROVIDERS,
    hostMatches,
    providerForUrl,
    providerForLocation,
    getPricingMode,
    getPricingNote
  };
})();
