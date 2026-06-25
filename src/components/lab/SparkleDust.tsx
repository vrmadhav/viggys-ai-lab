"use client";

import { useEffect, useRef } from "react";
import {
  SPARKLE_DUST_TUNING_EVENT,
  sparkleDustConfig,
  type RgbColor,
  type SparkleTheme,
} from "@/data/sparkleDust";

type Particle = {
  x: number;
  y: number;
  baseSize: number;
  size: number;
  color: RgbColor;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  twinkleSpeed: number;
  twinklePhase: number;
  glowPulse: number;
  driftFreq: number;
  driftAmp: number;
  driftPhase: number;
  scatterBias: number;
  flare: boolean;
};

type PointerState = {
  x: number;
  y: number;
  active: boolean;
  moving: boolean;
};

type StageSize = {
  width: number;
  height: number;
};

const THEME_CHANGE_EVENT = "lab:theme-change";

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTheme(): SparkleTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function pickColor(theme: SparkleTheme) {
  const palette = sparkleDustConfig.colors[theme];
  return palette[Math.floor(Math.random() * palette.length)];
}

function createParticle(
  size: StageSize,
  theme: SparkleTheme,
  init = false,
): Particle {
  const alpha = sparkleDustConfig.alpha[theme];

  return {
    x: Math.random() * size.width,
    y: init ? Math.random() * size.height : size.height + randomBetween(8, 28),
    baseSize: sparkleDustConfig.baseSize * randomBetween(0.42, 1.45),
    size: sparkleDustConfig.baseSize,
    color: pickColor(theme),
    alpha: 0,
    baseAlpha: randomBetween(alpha.min, alpha.max),
    vx: randomBetween(-0.5, 0.5) * sparkleDustConfig.randomVelocity,
    vy: -randomBetween(0.15, 0.38) * sparkleDustConfig.speed,
    ax: 0,
    ay: 0,
    twinkleSpeed: randomBetween(
      sparkleDustConfig.twinkle.speedMin,
      sparkleDustConfig.twinkle.speedMax,
    ),
    twinklePhase: Math.random() * Math.PI * 2,
    glowPulse: Math.random() * Math.PI * 2,
    driftFreq: randomBetween(
      sparkleDustConfig.drift.swayFrequencyMin,
      sparkleDustConfig.drift.swayFrequencyMax,
    ),
    driftAmp: randomBetween(
      sparkleDustConfig.drift.swayAmplitudeMin,
      sparkleDustConfig.drift.swayAmplitudeMax,
    ),
    driftPhase: Math.random() * Math.PI * 2,
    scatterBias: Math.random() * Math.PI * 2,
    flare: Math.random() > 0.86,
  };
}

function getParticleCount(size: StageSize) {
  const count = Math.round(
    (size.width * size.height * sparkleDustConfig.density) / 10000,
  );

  return clamp(
    count,
    sparkleDustConfig.minParticles,
    sparkleDustConfig.maxParticles,
  );
}

function updateParticle(
  particle: Particle,
  frame: number,
  pointer: PointerState,
  size: StageSize,
) {
  const twinkle = 0.5 + 0.5 * Math.sin(particle.twinklePhase);

  particle.twinklePhase += particle.twinkleSpeed;
  particle.glowPulse += 0.018;
  particle.alpha =
    particle.baseAlpha *
    (sparkleDustConfig.twinkle.alphaFloor +
      (1 - sparkleDustConfig.twinkle.alphaFloor) * twinkle);
  particle.size =
    particle.baseSize *
    (sparkleDustConfig.twinkle.sizeMin +
      (sparkleDustConfig.twinkle.sizeMax - sparkleDustConfig.twinkle.sizeMin) *
        twinkle);

  if (pointer.active) {
    const dx = particle.x - pointer.x;
    const dy = particle.y - pointer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.5) {
      if (pointer.moving && distance < sparkleDustConfig.mouse.repelRadius) {
        const force =
          (sparkleDustConfig.mouse.repelRadius - distance) /
          sparkleDustConfig.mouse.repelRadius;
        const pushX = dx / distance;
        const pushY = dy / distance;
        const bias = particle.scatterBias * sparkleDustConfig.mouse.scatterBias;
        const scatteredX = pushX * Math.cos(bias) - pushY * Math.sin(bias);
        const scatteredY = pushX * Math.sin(bias) + pushY * Math.cos(bias);
        const magnitude =
          force * force * sparkleDustConfig.mouse.repelStrength;

        particle.ax += scatteredX * magnitude * sparkleDustConfig.speed;
        particle.ay += scatteredY * magnitude * sparkleDustConfig.speed;
        particle.alpha = Math.min(
          1,
          particle.alpha * (1 + force * sparkleDustConfig.mouse.glowBoost),
        );
        particle.size =
          particle.baseSize *
          (1 + force * sparkleDustConfig.mouse.sizeBoost);
      } else if (distance < sparkleDustConfig.mouse.attractRadius) {
        const force =
          (sparkleDustConfig.mouse.attractRadius - distance) /
          sparkleDustConfig.mouse.attractRadius;
        const glow = 0.5 + 0.5 * Math.sin(particle.glowPulse);
        const attraction = force * sparkleDustConfig.mouse.attractStrength;

        particle.ax += (-dx / distance) * attraction * sparkleDustConfig.speed;
        particle.ay += (-dy / distance) * attraction * sparkleDustConfig.speed;
        particle.alpha = Math.min(
          1,
          particle.baseAlpha *
            (1 + force * sparkleDustConfig.mouse.glowBoost + glow * 0.3),
        );
        particle.size =
          particle.baseSize *
          (1 + force * sparkleDustConfig.mouse.sizeBoost * 0.55 + glow * 0.18);
      }
    }
  }

  const sway =
    Math.sin(frame * particle.driftFreq + particle.driftPhase) *
    particle.driftAmp;
  const targetVx =
    sway + randomBetween(-0.5, 0.5) * sparkleDustConfig.drift.jitter;
  const targetVy = -randomBetween(0.14, 0.22) * sparkleDustConfig.speed;

  particle.vx += particle.ax;
  particle.vy += particle.ay;
  particle.vx += (targetVx - particle.vx) * sparkleDustConfig.drift.smoothing;
  particle.vy += (targetVy - particle.vy) * sparkleDustConfig.drift.smoothing;
  particle.vx *= sparkleDustConfig.drift.frictionX;
  particle.vy *= sparkleDustConfig.drift.frictionY;
  particle.ax = 0;
  particle.ay = 0;

  particle.x += particle.vx;
  particle.y += particle.vy;

  if (particle.x < -24) particle.x = size.width + 24;
  if (particle.x > size.width + 24) particle.x = -24;
}

function drawParticle(
  context: CanvasRenderingContext2D,
  particle: Particle,
  theme: SparkleTheme,
) {
  const [red, green, blue] = particle.color;
  const themeAlpha = sparkleDustConfig.alpha[theme];
  const radius = particle.size;

  context.save();
  context.globalAlpha = particle.alpha * themeAlpha.glow;

  const gradient = context.createRadialGradient(
    particle.x,
    particle.y,
    0,
    particle.x,
    particle.y,
    radius * 4.2,
  );

  gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0.72)`);
  gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(particle.x, particle.y, radius * 4.2, 0, Math.PI * 2);
  context.fill();

  context.globalAlpha = particle.alpha * themeAlpha.core;
  context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
  context.beginPath();
  context.arc(particle.x, particle.y, Math.max(radius * 0.45, 0.45), 0, Math.PI * 2);
  context.fill();

  if (particle.flare) {
    context.globalAlpha = particle.alpha * 0.42;
    context.strokeStyle = `rgb(${red}, ${green}, ${blue})`;
    context.lineWidth = 0.65;
    context.beginPath();
    context.moveTo(particle.x - radius * 1.7, particle.y);
    context.lineTo(particle.x + radius * 1.7, particle.y);
    context.moveTo(particle.x, particle.y - radius * 1.7);
    context.lineTo(particle.x, particle.y + radius * 1.7);
    context.stroke();
  }

  context.restore();
}

export function SparkleDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context || motionQuery.matches) return;

    const canvasElement = canvas;
    const drawingContext = context;

    let theme = getTheme();
    let size: StageSize = { width: 0, height: 0 };
    let particles: Particle[] = [];
    let frame = 0;
    let animationFrame = 0;
    let moveTimer = 0;
    let pixelRatio = 1;

    const pointer: PointerState = {
      x: 0,
      y: 0,
      active: false,
      moving: false,
    };

    function syncParticles() {
      const targetCount = getParticleCount(size);

      while (particles.length < targetCount) {
        particles.push(createParticle(size, theme, true));
      }

      if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
      }
    }

    function resize() {
      const rect = canvasElement.getBoundingClientRect();

      size = {
        width: rect.width,
        height: rect.height,
      };
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvasElement.width = Math.max(1, Math.floor(size.width * pixelRatio));
      canvasElement.height = Math.max(1, Math.floor(size.height * pixelRatio));
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      syncParticles();
    }

    function refreshTheme() {
      const nextTheme = getTheme();

      if (nextTheme === theme) return;

      theme = nextTheme;
      particles = particles.map((particle) => {
        const alpha = sparkleDustConfig.alpha[theme];

        return {
          ...particle,
          color: pickColor(theme),
          baseAlpha: randomBetween(alpha.min, alpha.max),
        };
      });
    }

    function refreshTuning() {
      const alpha = sparkleDustConfig.alpha[theme];

      syncParticles();

      particles = particles.map((particle) => ({
        ...particle,
        baseSize: sparkleDustConfig.baseSize * randomBetween(0.42, 1.45),
        baseAlpha: randomBetween(alpha.min, alpha.max),
        twinkleSpeed: randomBetween(
          sparkleDustConfig.twinkle.speedMin,
          sparkleDustConfig.twinkle.speedMax,
        ),
        driftFreq: randomBetween(
          sparkleDustConfig.drift.swayFrequencyMin,
          sparkleDustConfig.drift.swayFrequencyMax,
        ),
        driftAmp: randomBetween(
          sparkleDustConfig.drift.swayAmplitudeMin,
          sparkleDustConfig.drift.swayAmplitudeMax,
        ),
      }));
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvasElement.getBoundingClientRect();

      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      pointer.moving = true;

      window.clearTimeout(moveTimer);
      moveTimer = window.setTimeout(() => {
        pointer.moving = false;
      }, sparkleDustConfig.mouse.moveTimeoutMs);
    }

    function onPointerLeave() {
      pointer.active = false;
      pointer.moving = false;
    }

    function loop() {
      drawingContext.clearRect(0, 0, size.width, size.height);
      frame += 1;

      for (const particle of particles) {
        updateParticle(particle, frame, pointer, size);

        if (particle.y < -28) {
          Object.assign(particle, createParticle(size, theme));
        }

        drawParticle(drawingContext, particle, theme);
      }

      animationFrame = window.requestAnimationFrame(loop);
    }

    const resizeObserver = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(refreshTheme);

    resize();
    resizeObserver.observe(canvasElement);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener(THEME_CHANGE_EVENT, refreshTheme);
    window.addEventListener(SPARKLE_DUST_TUNING_EVENT, refreshTuning);

    animationFrame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(moveTimer);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener(THEME_CHANGE_EVENT, refreshTheme);
      window.removeEventListener(SPARKLE_DUST_TUNING_EVENT, refreshTuning);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}
