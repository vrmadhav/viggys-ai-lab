"use client";

import { useState } from "react";
import { Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  SPARKLE_DUST_TUNING_EVENT,
  cloneSparkleDustConfig,
  sparkleDustConfig,
  sparkleDustDefaults,
  type SparkleDustConfig,
} from "@/data/sparkleDust";

type NumericControl = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  displayPrecision?: number;
  get: (config: SparkleDustConfig) => number;
  set: (config: SparkleDustConfig, value: number) => void;
};

type ControlGroup = {
  title: string;
  controls: NumericControl[];
};

const controlGroups: ControlGroup[] = [
  {
    title: "Core",
    controls: [
      {
        id: "density",
        label: "Density",
        min: 0,
        max: 3,
        step: 0.05,
        get: (config) => config.density,
        set: (config, value) => {
          config.density = value;
        },
      },
      {
        id: "minParticles",
        label: "Min particles",
        min: 0,
        max: 300,
        step: 1,
        get: (config) => config.minParticles,
        set: (config, value) => {
          config.minParticles = value;
        },
      },
      {
        id: "maxParticles",
        label: "Max particles",
        min: 20,
        max: 600,
        step: 1,
        get: (config) => config.maxParticles,
        set: (config, value) => {
          config.maxParticles = value;
        },
      },
      {
        id: "baseSize",
        label: "Base size",
        min: 0.3,
        max: 4,
        step: 0.05,
        get: (config) => config.baseSize,
        set: (config, value) => {
          config.baseSize = value;
        },
      },
      {
        id: "speed",
        label: "Speed",
        min: 0,
        max: 2,
        step: 0.02,
        get: (config) => config.speed,
        set: (config, value) => {
          config.speed = value;
        },
      },
      {
        id: "randomVelocity",
        label: "Random velocity",
        min: 0,
        max: 1.5,
        step: 0.02,
        get: (config) => config.randomVelocity,
        set: (config, value) => {
          config.randomVelocity = value;
        },
      },
    ],
  },
  {
    title: "Light opacity",
    controls: [
      {
        id: "lightAlphaMin",
        label: "Alpha min",
        min: 0,
        max: 1,
        step: 0.01,
        get: (config) => config.alpha.light.min,
        set: (config, value) => {
          config.alpha.light.min = value;
        },
      },
      {
        id: "lightAlphaMax",
        label: "Alpha max",
        min: 0,
        max: 1,
        step: 0.01,
        get: (config) => config.alpha.light.max,
        set: (config, value) => {
          config.alpha.light.max = value;
        },
      },
      {
        id: "lightGlow",
        label: "Glow",
        min: 0,
        max: 1.5,
        step: 0.01,
        get: (config) => config.alpha.light.glow,
        set: (config, value) => {
          config.alpha.light.glow = value;
        },
      },
      {
        id: "lightCore",
        label: "Core",
        min: 0,
        max: 1.5,
        step: 0.01,
        get: (config) => config.alpha.light.core,
        set: (config, value) => {
          config.alpha.light.core = value;
        },
      },
    ],
  },
  {
    title: "Dark opacity",
    controls: [
      {
        id: "darkAlphaMin",
        label: "Alpha min",
        min: 0,
        max: 1,
        step: 0.005,
        displayPrecision: 3,
        get: (config) => config.alpha.dark.min,
        set: (config, value) => {
          config.alpha.dark.min = value;
        },
      },
      {
        id: "darkAlphaMax",
        label: "Alpha max",
        min: 0,
        max: 1,
        step: 0.01,
        get: (config) => config.alpha.dark.max,
        set: (config, value) => {
          config.alpha.dark.max = value;
        },
      },
      {
        id: "darkGlow",
        label: "Glow",
        min: 0,
        max: 1.5,
        step: 0.01,
        get: (config) => config.alpha.dark.glow,
        set: (config, value) => {
          config.alpha.dark.glow = value;
        },
      },
      {
        id: "darkCore",
        label: "Core",
        min: 0,
        max: 1.5,
        step: 0.01,
        get: (config) => config.alpha.dark.core,
        set: (config, value) => {
          config.alpha.dark.core = value;
        },
      },
    ],
  },
  {
    title: "Twinkle",
    controls: [
      {
        id: "twinkleAlphaFloor",
        label: "Alpha floor",
        min: 0,
        max: 1,
        step: 0.01,
        get: (config) => config.twinkle.alphaFloor,
        set: (config, value) => {
          config.twinkle.alphaFloor = value;
        },
      },
      {
        id: "twinkleSizeMin",
        label: "Size min",
        min: 0.1,
        max: 2,
        step: 0.01,
        get: (config) => config.twinkle.sizeMin,
        set: (config, value) => {
          config.twinkle.sizeMin = value;
        },
      },
      {
        id: "twinkleSizeMax",
        label: "Size max",
        min: 0.1,
        max: 2.5,
        step: 0.01,
        get: (config) => config.twinkle.sizeMax,
        set: (config, value) => {
          config.twinkle.sizeMax = value;
        },
      },
      {
        id: "twinkleSpeedMin",
        label: "Speed min",
        min: 0,
        max: 0.08,
        step: 0.001,
        displayPrecision: 3,
        get: (config) => config.twinkle.speedMin,
        set: (config, value) => {
          config.twinkle.speedMin = value;
        },
      },
      {
        id: "twinkleSpeedMax",
        label: "Speed max",
        min: 0,
        max: 0.1,
        step: 0.001,
        displayPrecision: 3,
        get: (config) => config.twinkle.speedMax,
        set: (config, value) => {
          config.twinkle.speedMax = value;
        },
      },
    ],
  },
  {
    title: "Drift",
    controls: [
      {
        id: "swayFrequencyMin",
        label: "Frequency min",
        min: 0,
        max: 0.05,
        step: 0.001,
        displayPrecision: 3,
        get: (config) => config.drift.swayFrequencyMin,
        set: (config, value) => {
          config.drift.swayFrequencyMin = value;
        },
      },
      {
        id: "swayFrequencyMax",
        label: "Frequency max",
        min: 0,
        max: 0.08,
        step: 0.001,
        displayPrecision: 3,
        get: (config) => config.drift.swayFrequencyMax,
        set: (config, value) => {
          config.drift.swayFrequencyMax = value;
        },
      },
      {
        id: "swayAmplitudeMin",
        label: "Amplitude min",
        min: 0,
        max: 1,
        step: 0.01,
        get: (config) => config.drift.swayAmplitudeMin,
        set: (config, value) => {
          config.drift.swayAmplitudeMin = value;
        },
      },
      {
        id: "swayAmplitudeMax",
        label: "Amplitude max",
        min: 0,
        max: 1.2,
        step: 0.01,
        get: (config) => config.drift.swayAmplitudeMax,
        set: (config, value) => {
          config.drift.swayAmplitudeMax = value;
        },
      },
      {
        id: "jitter",
        label: "Jitter",
        min: 0,
        max: 0.3,
        step: 0.005,
        displayPrecision: 3,
        get: (config) => config.drift.jitter,
        set: (config, value) => {
          config.drift.jitter = value;
        },
      },
      {
        id: "smoothing",
        label: "Smoothing",
        min: 0,
        max: 0.15,
        step: 0.001,
        displayPrecision: 3,
        get: (config) => config.drift.smoothing,
        set: (config, value) => {
          config.drift.smoothing = value;
        },
      },
      {
        id: "frictionX",
        label: "Friction X",
        min: 0.85,
        max: 1,
        step: 0.001,
        displayPrecision: 3,
        get: (config) => config.drift.frictionX,
        set: (config, value) => {
          config.drift.frictionX = value;
        },
      },
      {
        id: "frictionY",
        label: "Friction Y",
        min: 0.85,
        max: 1,
        step: 0.001,
        displayPrecision: 3,
        get: (config) => config.drift.frictionY,
        set: (config, value) => {
          config.drift.frictionY = value;
        },
      },
    ],
  },
  {
    title: "Mouse",
    controls: [
      {
        id: "moveTimeoutMs",
        label: "Move timeout",
        min: 0,
        max: 500,
        step: 10,
        get: (config) => config.mouse.moveTimeoutMs,
        set: (config, value) => {
          config.mouse.moveTimeoutMs = value;
        },
      },
      {
        id: "repelRadius",
        label: "Repel radius",
        min: 0,
        max: 260,
        step: 1,
        get: (config) => config.mouse.repelRadius,
        set: (config, value) => {
          config.mouse.repelRadius = value;
        },
      },
      {
        id: "repelStrength",
        label: "Repel strength",
        min: 0,
        max: 5,
        step: 0.05,
        get: (config) => config.mouse.repelStrength,
        set: (config, value) => {
          config.mouse.repelStrength = value;
        },
      },
      {
        id: "attractRadius",
        label: "Attract radius",
        min: 0,
        max: 320,
        step: 1,
        get: (config) => config.mouse.attractRadius,
        set: (config, value) => {
          config.mouse.attractRadius = value;
        },
      },
      {
        id: "attractStrength",
        label: "Attract strength",
        min: 0,
        max: 0.2,
        step: 0.001,
        displayPrecision: 3,
        get: (config) => config.mouse.attractStrength,
        set: (config, value) => {
          config.mouse.attractStrength = value;
        },
      },
      {
        id: "scatterBias",
        label: "Scatter bias",
        min: 0,
        max: 2,
        step: 0.01,
        get: (config) => config.mouse.scatterBias,
        set: (config, value) => {
          config.mouse.scatterBias = value;
        },
      },
      {
        id: "glowBoost",
        label: "Glow boost",
        min: 0,
        max: 4,
        step: 0.05,
        get: (config) => config.mouse.glowBoost,
        set: (config, value) => {
          config.mouse.glowBoost = value;
        },
      },
      {
        id: "sizeBoost",
        label: "Size boost",
        min: 0,
        max: 3,
        step: 0.05,
        get: (config) => config.mouse.sizeBoost,
        set: (config, value) => {
          config.mouse.sizeBoost = value;
        },
      },
    ],
  },
];

const numericControls = controlGroups.flatMap((group) => group.controls);

const orderedPairs = [
  {
    minId: "minParticles",
    maxId: "maxParticles",
    getMin: (config: SparkleDustConfig) => config.minParticles,
    getMax: (config: SparkleDustConfig) => config.maxParticles,
    setMin: (config: SparkleDustConfig, value: number) => {
      config.minParticles = value;
    },
    setMax: (config: SparkleDustConfig, value: number) => {
      config.maxParticles = value;
    },
  },
  {
    minId: "lightAlphaMin",
    maxId: "lightAlphaMax",
    getMin: (config: SparkleDustConfig) => config.alpha.light.min,
    getMax: (config: SparkleDustConfig) => config.alpha.light.max,
    setMin: (config: SparkleDustConfig, value: number) => {
      config.alpha.light.min = value;
    },
    setMax: (config: SparkleDustConfig, value: number) => {
      config.alpha.light.max = value;
    },
  },
  {
    minId: "darkAlphaMin",
    maxId: "darkAlphaMax",
    getMin: (config: SparkleDustConfig) => config.alpha.dark.min,
    getMax: (config: SparkleDustConfig) => config.alpha.dark.max,
    setMin: (config: SparkleDustConfig, value: number) => {
      config.alpha.dark.min = value;
    },
    setMax: (config: SparkleDustConfig, value: number) => {
      config.alpha.dark.max = value;
    },
  },
  {
    minId: "twinkleSizeMin",
    maxId: "twinkleSizeMax",
    getMin: (config: SparkleDustConfig) => config.twinkle.sizeMin,
    getMax: (config: SparkleDustConfig) => config.twinkle.sizeMax,
    setMin: (config: SparkleDustConfig, value: number) => {
      config.twinkle.sizeMin = value;
    },
    setMax: (config: SparkleDustConfig, value: number) => {
      config.twinkle.sizeMax = value;
    },
  },
  {
    minId: "twinkleSpeedMin",
    maxId: "twinkleSpeedMax",
    getMin: (config: SparkleDustConfig) => config.twinkle.speedMin,
    getMax: (config: SparkleDustConfig) => config.twinkle.speedMax,
    setMin: (config: SparkleDustConfig, value: number) => {
      config.twinkle.speedMin = value;
    },
    setMax: (config: SparkleDustConfig, value: number) => {
      config.twinkle.speedMax = value;
    },
  },
  {
    minId: "swayFrequencyMin",
    maxId: "swayFrequencyMax",
    getMin: (config: SparkleDustConfig) => config.drift.swayFrequencyMin,
    getMax: (config: SparkleDustConfig) => config.drift.swayFrequencyMax,
    setMin: (config: SparkleDustConfig, value: number) => {
      config.drift.swayFrequencyMin = value;
    },
    setMax: (config: SparkleDustConfig, value: number) => {
      config.drift.swayFrequencyMax = value;
    },
  },
  {
    minId: "swayAmplitudeMin",
    maxId: "swayAmplitudeMax",
    getMin: (config: SparkleDustConfig) => config.drift.swayAmplitudeMin,
    getMax: (config: SparkleDustConfig) => config.drift.swayAmplitudeMax,
    setMin: (config: SparkleDustConfig, value: number) => {
      config.drift.swayAmplitudeMin = value;
    },
    setMax: (config: SparkleDustConfig, value: number) => {
      config.drift.swayAmplitudeMax = value;
    },
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getStepPrecision(step: number) {
  const [, decimals = ""] = step.toString().split(".");
  return decimals.length;
}

function normalizeSliderValue(value: number, control: NumericControl) {
  const precision = getStepPrecision(control.step);
  return Number(clamp(value, control.min, control.max).toFixed(precision));
}

function formatValue(value: number, control: NumericControl) {
  const precision =
    control.displayPrecision ??
    (control.step >= 1 ? 0 : control.step >= 0.01 ? 2 : 3);

  return value.toFixed(precision);
}

function readControlValues() {
  return Object.fromEntries(
    numericControls.map((control) => [
      control.id,
      control.get(sparkleDustConfig),
    ]),
  );
}

function enforceOrderedPairs(changedId: string) {
  for (const pair of orderedPairs) {
    const min = pair.getMin(sparkleDustConfig);
    const max = pair.getMax(sparkleDustConfig);

    if (min <= max) continue;

    if (changedId === pair.minId) {
      pair.setMax(sparkleDustConfig, min);
    } else {
      pair.setMin(sparkleDustConfig, max);
    }
  }
}

function emitTuningChange() {
  window.dispatchEvent(new CustomEvent(SPARKLE_DUST_TUNING_EVENT));
}

function buildConfigSnippet(config: SparkleDustConfig) {
  return `export const sparkleDustConfig = ${JSON.stringify(
    config,
    null,
    2,
  )} satisfies SparkleDustConfig;`;
}

export function SparkleDustTuner() {
  const [values, setValues] = useState<Record<string, number>>(
    readControlValues,
  );
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  function updateControl(control: NumericControl, value: number) {
    control.set(sparkleDustConfig, normalizeSliderValue(value, control));
    enforceOrderedPairs(control.id);
    setValues(readControlValues());
    emitTuningChange();
    setCopyState("idle");
  }

  function resetSettings() {
    Object.assign(sparkleDustConfig, cloneSparkleDustConfig(sparkleDustDefaults));
    setValues(readControlValues());
    emitTuningChange();
    setCopyState("idle");
  }

  async function copySettings() {
    try {
      await navigator.clipboard.writeText(buildConfigSnippet(sparkleDustConfig));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <aside
      className="fixed bottom-4 left-4 z-50 flex max-h-[min(76vh,760px)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-border bg-card/95 text-card-foreground shadow-modal backdrop-blur-md"
      aria-label="Sparkle dust tuner"
      onPointerDown={(event) => event.stopPropagation()}
      onPointerLeave={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
    >
      <div className="shrink-0 border-b border-border p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold leading-5">Sparkle dust</h2>
            <p className="text-xs text-muted-foreground">Temporary tuner</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5"
              onClick={copySettings}
            >
              <Copy className="h-3.5 w-3.5" />
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Failed"
                  : "Copy"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2.5"
              onClick={resetSettings}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid gap-5">
          {controlGroups.map((group) => (
            <section key={group.title} className="grid gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                {group.title}
              </h3>
              <div className="grid gap-3">
                {group.controls.map((control) => {
                  const value = values[control.id] ?? control.get(sparkleDustConfig);

                  return (
                    <label key={control.id} className="grid gap-1.5">
                      <span className="flex items-center justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate font-medium">
                          {control.label}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                          {formatValue(value, control)}
                        </span>
                      </span>
                      <Slider
                        value={[value]}
                        min={control.min}
                        max={control.max}
                        step={control.step}
                        onValueChange={([nextValue]) => {
                          updateControl(control, nextValue);
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}
