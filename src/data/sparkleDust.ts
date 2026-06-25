export type SparkleTheme = "light" | "dark";

export type RgbColor = readonly [number, number, number];

export type SparkleDustConfig = {
  density: number;
  minParticles: number;
  maxParticles: number;
  baseSize: number;
  speed: number;
  randomVelocity: number;
  alpha: Record<
    SparkleTheme,
    {
      min: number;
      max: number;
      glow: number;
      core: number;
    }
  >;
  colors: Record<SparkleTheme, readonly RgbColor[]>;
  twinkle: {
    alphaFloor: number;
    sizeMin: number;
    sizeMax: number;
    speedMin: number;
    speedMax: number;
  };
  drift: {
    swayFrequencyMin: number;
    swayFrequencyMax: number;
    swayAmplitudeMin: number;
    swayAmplitudeMax: number;
    jitter: number;
    smoothing: number;
    frictionX: number;
    frictionY: number;
  };
  mouse: {
    moveTimeoutMs: number;
    repelRadius: number;
    repelStrength: number;
    attractRadius: number;
    attractStrength: number;
    scatterBias: number;
    glowBoost: number;
    sizeBoost: number;
  };
};

export const SPARKLE_DUST_TUNING_EVENT = "lab:sparkle-dust-tuning";

export function cloneSparkleDustConfig(
  config: SparkleDustConfig,
): SparkleDustConfig {
  return {
    ...config,
    alpha: {
      light: { ...config.alpha.light },
      dark: { ...config.alpha.dark },
    },
    colors: {
      light: config.colors.light.map((color) => [...color] as RgbColor),
      dark: config.colors.dark.map((color) => [...color] as RgbColor),
    },
    twinkle: { ...config.twinkle },
    drift: { ...config.drift },
    mouse: { ...config.mouse },
  };
}

export const sparkleDustDefaults = {
  // Particles per 10,000 CSS pixels. Raise this for denser dust.
  density: 1.25,
  minParticles: 114,
  maxParticles: 568,
  baseSize: 1.4,
  speed: 0.82,
  randomVelocity: 0.76,
  alpha: {
    light: {
      min: 0.57,
      max: 0.8,
      glow: 0.26,
      core: 0.74,
    },
    dark: {
      min: 0.6,
      max: 0.82,
      glow: 0.38,
      core: 0.69,
    },
  },
  colors: {
    light: [
      [190, 24, 147],
      [219, 39, 119],
      [168, 85, 247],
      [244, 114, 182],
      [251, 207, 232],
    ],
    dark: [
      [244, 114, 182],
      [232, 121, 249],
      [216, 180, 254],
      [251, 207, 232],
      [192, 132, 252],
    ],
  },
  twinkle: {
    alphaFloor: 0.42,
    sizeMin: 0.82,
    sizeMax: 1.24,
    speedMin: 0.008,
    speedMax: 0.028,
  },
  drift: {
    swayFrequencyMin: 0.006,
    swayFrequencyMax: 0.018,
    swayAmplitudeMin: 0.12,
    swayAmplitudeMax: 0.34,
    jitter: 0.045,
    smoothing: 0.024,
    frictionX: 0.962,
    frictionY: 0.972,
  },
  mouse: {
    moveTimeoutMs: 120,
    repelRadius: 92,
    repelStrength: 1.65,
    attractRadius: 148,
    attractStrength: 0.035,
    scatterBias: 0.55,
    glowBoost: 1.28,
    sizeBoost: 0.72,
  },
} satisfies SparkleDustConfig;

export const sparkleDustConfig: SparkleDustConfig = cloneSparkleDustConfig(
  sparkleDustDefaults,
);
