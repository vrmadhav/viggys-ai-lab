export type SparkleTheme = "light" | "dark";

export type HexColor = `#${string}`;

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
  colors: Record<SparkleTheme, readonly HexColor[]>;
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

export const sparkleDustConfig = {
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
    light: ["#be1893", "#db2777", "#a855f7", "#6679db", "#769ae4"],
    dark: ["#f472b6", "#e879f9", "#d8b4fe", "#6363ea", "#a6b9e2"],
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
