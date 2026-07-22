import type {
  CompiledImageRequest,
  ImageGenerationProvider,
  ImageGenerationResult,
} from "../../types";

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character] ?? character);
}

export class MockImageProvider implements ImageGenerationProvider {
  id = "mock";

  isAvailable() {
    return true;
  }

  async generate(input: CompiledImageRequest): Promise<ImageGenerationResult> {
    await new Promise((resolve) => setTimeout(resolve, 650 + (hash(input.prompt) % 900)));
    if (input.prompt.includes("[mock-failure]")) {
      throw new Error("The mock provider was asked to simulate a failed preview.");
    }

    const value = hash(input.prompt);
    const hueA = value % 360;
    const hueB = (hueA + 64 + (value % 80)) % 360;
    const line = input.prompt.split("\n")[0].replace("Creative thesis: ", "").slice(0, 74);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hueA} 38% 18%)"/><stop offset="1" stop-color="hsl(${hueB} 52% 64%)"/></linearGradient>
        <filter id="n"><feTurbulence baseFrequency=".75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .13"/></feComponentTransfer></filter>
      </defs>
      <rect width="1024" height="1024" fill="url(#g)"/>
      <circle cx="${180 + (value % 520)}" cy="${170 + ((value >>> 4) % 480)}" r="${100 + (value % 250)}" fill="hsl(${hueB} 75% 82% / .25)"/>
      <path d="M0 ${610 + (value % 180)} Q 260 ${420 + (value % 140)} 520 ${680 - (value % 120)} T 1024 570 V1024 H0Z" fill="hsl(${hueA} 25% 8% / .56)"/>
      <rect width="1024" height="1024" filter="url(#n)" opacity=".65"/>
      <rect x="58" y="744" width="908" height="220" rx="28" fill="hsl(${hueA} 20% 8% / .74)"/>
      <text x="94" y="808" fill="white" font-family="system-ui,sans-serif" font-size="22" letter-spacing="3">MOCK PREVIEW</text>
      <text x="94" y="865" fill="white" font-family="Georgia,serif" font-size="38">${escapeXml(line)}</text>
      <text x="94" y="918" fill="white" opacity=".64" font-family="system-ui,sans-serif" font-size="18">Stable placeholder · prompt hash ${value.toString(16)}</text>
    </svg>`;

    return {
      provider: this.id,
      model: "deterministic-svg-v1",
      base64: Buffer.from(svg).toString("base64"),
      metadata: { mimeType: "image/svg+xml", mock: true },
    };
  }
}

