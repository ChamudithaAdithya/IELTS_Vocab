import React, { useEffect, useRef } from 'react';
import type { BuddyOrbState } from '../../types/speakingBuddy';

export interface BuddyEnergyOrbProps {
  state: BuddyOrbState;
  /** Mutable ref holding live mic or TTS voice amplitude (0–100) for 60 FPS voice reactivity */
  audioLevelRef: React.MutableRefObject<number>;
  onClick?: () => void;
  size?: number;
}

interface StarParticle {
  theta: number;
  phi: number;
  radiusFrac: number;
  speedTheta: number;
  speedPhi: number;
  size: number;
  twinkleOffset: number;
  twinkleSpeed: number;
  color: string;
  bokeh: boolean;
}

interface OuterMote {
  angle: number;
  orbitRx: number;
  orbitRy: number;
  tilt: number;
  speed: number;
  size: number;
  phase: number;
  color: string;
}

interface StateMotionConfig {
  ribbonSpeed: number;
  starSpeed: number;
  ringSpeed: number;
  ringExpand: number;
  haloIntensity: number;
  magentaBoost: number;
  cyanBoost: number;
  goldBoost: number;
  emeraldBoost: number;
  errorTint: number;
  wobbleAmp: number;
  bounceAmp: number;
  dimFactor: number;
}

/** Phase 5 — Complete 14-State Living Crystal Orb Motion & Aura Matrix (Refined & Non-Distracting) */
const STATE_MOTION: Record<BuddyOrbState, StateMotionConfig> = {
  idle: {
    ribbonSpeed: 0.009,
    starSpeed: 0.0038,
    ringSpeed: 0.006,
    ringExpand: 0.0,
    haloIntensity: 0.78,
    magentaBoost: 1.0,
    cyanBoost: 1.0,
    goldBoost: 0,
    emeraldBoost: 0,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  listening: {
    ribbonSpeed: 0.02,
    starSpeed: 0.009,
    ringSpeed: 0.015,
    ringExpand: 0.07,
    haloIntensity: 1.05,
    magentaBoost: 0.92,
    cyanBoost: 1.28,
    goldBoost: 0,
    emeraldBoost: 0,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  transcribing: {
    ribbonSpeed: 0.028,
    starSpeed: 0.014,
    ringSpeed: 0.022,
    ringExpand: 0.03,
    haloIntensity: 0.98,
    magentaBoost: 1.12,
    cyanBoost: 1.18,
    goldBoost: 0,
    emeraldBoost: 0,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  understanding: {
    ribbonSpeed: 0.032,
    starSpeed: 0.016,
    ringSpeed: 0.026,
    ringExpand: 0.04,
    haloIntensity: 1.0,
    magentaBoost: 1.18,
    cyanBoost: 1.15,
    goldBoost: 0,
    emeraldBoost: 0,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  thinking: {
    ribbonSpeed: 0.042,
    starSpeed: 0.02,
    ringSpeed: 0.032,
    ringExpand: 0.05,
    haloIntensity: 1.08,
    magentaBoost: 1.25,
    cyanBoost: 1.12,
    goldBoost: 0,
    emeraldBoost: 0,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  speaking: {
    ribbonSpeed: 0.03,
    starSpeed: 0.011,
    ringSpeed: 0.02,
    ringExpand: 0.08,
    haloIntensity: 1.12,
    magentaBoost: 1.18,
    cyanBoost: 1.22,
    goldBoost: 0,
    emeraldBoost: 0,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  interrupted: {
    ribbonSpeed: 0.036,
    starSpeed: 0.018,
    ringSpeed: 0.028,
    ringExpand: 0.1,
    haloIntensity: 1.08,
    magentaBoost: 1.05,
    cyanBoost: 1.32,
    goldBoost: 0.18,
    emeraldBoost: 0,
    errorTint: 0,
    wobbleAmp: 2.2,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  happy: {
    ribbonSpeed: 0.022,
    starSpeed: 0.011,
    ringSpeed: 0.016,
    ringExpand: 0.06,
    haloIntensity: 1.12,
    magentaBoost: 1.35,
    cyanBoost: 1.05,
    goldBoost: 0.14,
    emeraldBoost: 0,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 3.5,
    dimFactor: 1.0
  },
  encouraging: {
    ribbonSpeed: 0.025,
    starSpeed: 0.014,
    ringSpeed: 0.018,
    ringExpand: 0.06,
    haloIntensity: 1.15,
    magentaBoost: 1.02,
    cyanBoost: 1.0,
    goldBoost: 0.78,
    emeraldBoost: 0.15,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 2.8,
    dimFactor: 1.0
  },
  analyzing: {
    ribbonSpeed: 0.018,
    starSpeed: 0.009,
    ringSpeed: 0.014,
    ringExpand: 0.02,
    haloIntensity: 0.92,
    magentaBoost: 0.9,
    cyanBoost: 1.22,
    goldBoost: 0,
    emeraldBoost: 0.25,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  correcting: {
    ribbonSpeed: 0.02,
    starSpeed: 0.01,
    ringSpeed: 0.016,
    ringExpand: 0.04,
    haloIntensity: 1.02,
    magentaBoost: 0.85,
    cyanBoost: 1.25,
    goldBoost: 0,
    emeraldBoost: 0.72,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  deep_thinking: {
    ribbonSpeed: 0.036,
    starSpeed: 0.022,
    ringSpeed: 0.028,
    ringExpand: 0.05,
    haloIntensity: 1.08,
    magentaBoost: 1.32,
    cyanBoost: 1.22,
    goldBoost: 0.15,
    emeraldBoost: 0,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  confused: {
    ribbonSpeed: 0.015,
    starSpeed: 0.01,
    ringSpeed: 0.012,
    ringExpand: 0.01,
    haloIntensity: 0.88,
    magentaBoost: 1.1,
    cyanBoost: 0.82,
    goldBoost: 0.3,
    emeraldBoost: 0,
    errorTint: 0.12,
    wobbleAmp: 3.0,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  error: {
    ribbonSpeed: 0.016,
    starSpeed: 0.005,
    ringSpeed: 0.01,
    ringExpand: 0.0,
    haloIntensity: 0.9,
    magentaBoost: 1.2,
    cyanBoost: 0.55,
    goldBoost: 0,
    emeraldBoost: 0,
    errorTint: 0.72,
    wobbleAmp: 1.8,
    bounceAmp: 0,
    dimFactor: 1.0
  },
  sleeping: {
    ribbonSpeed: 0.0035,
    starSpeed: 0.0014,
    ringSpeed: 0.0025,
    ringExpand: -0.04,
    haloIntensity: 0.36,
    magentaBoost: 0.62,
    cyanBoost: 0.62,
    goldBoost: 0,
    emeraldBoost: 0,
    errorTint: 0,
    wobbleAmp: 0,
    bounceAmp: 0,
    dimFactor: 0.68
  }
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Living Crystal Orb — Central Visual Identity of Lingo Buddy.
 * Renders a luminous translucent crystal sphere floating natively on light glassmorphism:
 *  - Sculpted layered translucent outer glass-silk energy rings (cyan & lavender-rose)
 *  - Floating outer & internal bokeh stardust particles
 *  - Deep sapphire upper core, diagonal electric-cyan nebula sweep, orchid-magenta lower glow
 *  - Internal curved glass meniscus, overhead white studio specular & bottom pink caustic
 *  - Pre-baked fine frosted-glass micro-grain texture & smooth 14-state reactivity
 */
export const BuddyEnergyOrb: React.FC<BuddyEnergyOrbProps> = ({
  state,
  audioLevelRef,
  onClick,
  size = 260
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<BuddyOrbState>(state);
  const pointerRef = useRef<{ tx: number; ty: number; x: number; y: number }>({
    tx: 0,
    ty: 0,
    x: 0,
    y: 0
  });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Pre-bake subtle crystalline frosted-glass micro-grain tile once (zero per-frame overhead)
    const noiseTile = document.createElement('canvas');
    noiseTile.width = 128;
    noiseTile.height = 128;
    const nCtx = noiseTile.getContext('2d');
    let noisePattern: CanvasPattern | null = null;
    if (nCtx) {
      const imgData = nCtx.createImageData(128, 128);
      const buf = imgData.data;
      let seed = 133791;
      for (let i = 0; i < buf.length; i += 4) {
        seed = (seed * 16807) % 2147483647;
        const v = (seed / 2147483647) * 255;
        buf[i] = Math.min(255, v * 0.97 + 8);
        buf[i + 1] = Math.min(255, v * 0.98 + 7);
        buf[i + 2] = Math.min(255, v + 12);
        buf[i + 3] = v > 165 ? 58 : v < 80 ? 36 : 18;
      }
      nCtx.putImageData(imgData, 0, 0);
      noisePattern = ctx.createPattern(noiseTile, 'repeat');
    }

    // Seed 78 3D internal bokeh stardust particles concentrated along the diagonal nebula
    const starPalette = ['#ffffff', '#e0f2fe', '#7dd3fc', '#38bdf8', '#ddd6fe', '#f5d0fe', '#ffffff'];
    const stars: StarParticle[] = Array.from({ length: 78 }, (_, i) => ({
      theta: ((i * 137.508) % 360) * (Math.PI / 180),
      phi: Math.acos(1 - (2 * ((i + 0.5) / 78))),
      radiusFrac: 0.14 + ((i * 29) % 78) / 100,
      speedTheta: (0.4 + (i % 7) * 0.12) * (i % 2 === 0 ? 1 : -0.65),
      speedPhi: (0.16 + (i % 5) * 0.06) * (i % 3 === 0 ? 1 : -1),
      size: i % 11 === 0 ? 3.4 : i % 5 === 0 ? 2.2 : i % 3 === 0 ? 1.5 : 1.0,
      twinkleOffset: i * 0.77,
      twinkleSpeed: 1.4 + (i % 5) * 0.45,
      color: starPalette[i % starPalette.length],
      bokeh: i % 4 === 0
    }));

    // Seed 18 delicate floating light motes drifting in the outer translucent energy rings
    const outerMotes: OuterMote[] = Array.from({ length: 18 }, (_, i) => ({
      angle: (i * Math.PI * 2) / 18 + (i % 3) * 0.25,
      orbitRx: 1.12 + (i % 5) * 0.075,
      orbitRy: 0.92 + (i % 4) * 0.09,
      tilt: i % 2 === 0 ? -0.32 : 0.36,
      speed: (0.28 + (i % 5) * 0.09) * (i % 2 === 0 ? 1 : -1),
      size: i % 4 === 0 ? 2.1 : 1.25,
      phase: i * 1.13,
      color: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#bae6fd' : '#f5d0fe'
    }));

    let rafId = 0;
    let time = 0;
    let ringPhase = 0;
    let smoothAmp = 0.08;
    let curRibbonSpeed = STATE_MOTION.idle.ribbonSpeed;
    let curStarSpeed = STATE_MOTION.idle.starSpeed;
    let curRingSpeed = STATE_MOTION.idle.ringSpeed;
    let curRingExpand = 0;
    let curHalo = STATE_MOTION.idle.haloIntensity;
    let curCyan = 1.0;
    let curMagenta = 1.0;
    let curGold = 0;
    let curEmerald = 0;
    let curError = 0;
    let curWobble = 0;
    let curBounce = 0;
    let curDim = 1.0;

    // Helper: draw a silky blurred internal nebula wave band inside the crystal sphere
    const drawInternalNebulaWave = (
      cx: number,
      cy: number,
      R: number,
      opts: {
        yOffsetA: number;
        yOffsetB: number;
        ctrlY1: number;
        ctrlY2: number;
        thickness: number;
        phaseShift: number;
        waveAmp: number;
        colors: [string, string, string];
        ridgeColor: string;
        alpha: number;
        tiltX: number;
        tiltY: number;
        blurPx: number;
      }
    ) => {
      const steps = 40;
      const topPts: [number, number][] = [];
      const botPts: [number, number][] = [];

      const xStart = cx - R * 1.2 + opts.tiltX * 12;
      const xEnd = cx + R * 1.2 + opts.tiltX * 12;

      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const inv = 1 - u;
        const x = lerp(xStart, xEnd, u);
        const y0 = cy + opts.yOffsetA * R + opts.tiltY * 12;
        const y1 = cy + opts.ctrlY1 * R + opts.tiltY * 12;
        const y2 = cy + opts.ctrlY2 * R + opts.tiltY * 12;
        const y3 = cy + opts.yOffsetB * R + opts.tiltY * 12;

        const spineY =
          inv * inv * inv * y0 +
          3 * inv * inv * u * y1 +
          3 * inv * u * u * y2 +
          u * u * u * y3;

        const ripple =
          Math.sin(u * Math.PI * 2.2 - time * 1.45 + opts.phaseShift) * opts.waveAmp +
          Math.cos(u * Math.PI * 3.8 + time * 1.05 + opts.phaseShift) * (opts.waveAmp * 0.4);

        const swell = 0.45 + Math.sin(u * Math.PI) * 0.78 + Math.sin(u * Math.PI * 2 + time * 0.8) * 0.12;
        const halfH = opts.thickness * R * swell;

        topPts.push([x, spineY + ripple - halfH * 0.5]);
        botPts.push([x, spineY + ripple + halfH]);
      }

      ctx.save();
      ctx.filter = `blur(${opts.blurPx}px)`;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        if (i === 0) ctx.moveTo(topPts[i][0], topPts[i][1]);
        else ctx.lineTo(topPts[i][0], topPts[i][1]);
      }
      for (let i = steps; i >= 0; i--) {
        ctx.lineTo(botPts[i][0], botPts[i][1]);
      }
      ctx.closePath();

      const grad = ctx.createLinearGradient(xStart, cy + R * 0.35, xEnd, cy - R * 0.35);
      grad.addColorStop(0, opts.colors[0]);
      grad.addColorStop(0.5, opts.colors[1]);
      grad.addColorStop(1, opts.colors[2]);
      ctx.globalAlpha = opts.alpha;
      ctx.fillStyle = grad;
      ctx.fill();

      // Soft diffused upper silk crest
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        if (i === 0) ctx.moveTo(topPts[i][0], topPts[i][1]);
        else ctx.lineTo(topPts[i][0], topPts[i][1]);
      }
      ctx.filter = `blur(${Math.max(2.5, opts.blurPx * 0.65)}px)`;
      ctx.strokeStyle = opts.ridgeColor;
      ctx.lineWidth = 2.8;
      ctx.globalAlpha = Math.min(0.65, opts.alpha * 0.65);
      ctx.stroke();
      ctx.restore();
    };

    // Helper: draw sculpted translucent glass-silk outer energy shell wrapping around the orb
    const drawOuterGlassShell = (
      cx: number,
      cy: number,
      rx: number,
      ry: number,
      rotation: number,
      fillStart: string,
      fillMid: string,
      fillEnd: string,
      rimStart: string,
      rimEnd: string,
      rimWidth: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      // Soft translucent glass-veil fill
      const veilGrad = ctx.createLinearGradient(-rx, -ry * 0.6, rx, ry * 0.6);
      veilGrad.addColorStop(0, fillStart);
      veilGrad.addColorStop(0.5, fillMid);
      veilGrad.addColorStop(1, fillEnd);
      ctx.fillStyle = veilGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crisp iridescent thin edge highlight (like sculpted crystal-glass ribbons around the reference orb)
      const edgeGrad = ctx.createLinearGradient(-rx, -ry * 0.5, rx, ry * 0.5);
      edgeGrad.addColorStop(0, rimStart);
      edgeGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.78)');
      edgeGrad.addColorStop(1, rimEnd);
      ctx.strokeStyle = edgeGrad;
      ctx.lineWidth = rimWidth;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      const st = stateRef.current;
      const cfg = STATE_MOTION[st] || STATE_MOTION.idle;

      // Smooth transitions between all 14 states
      curRibbonSpeed = lerp(curRibbonSpeed, cfg.ribbonSpeed, 0.055);
      curStarSpeed = lerp(curStarSpeed, cfg.starSpeed, 0.055);
      curRingSpeed = lerp(curRingSpeed, cfg.ringSpeed, 0.055);
      curRingExpand = lerp(curRingExpand, cfg.ringExpand, 0.06);
      curHalo = lerp(curHalo, cfg.haloIntensity, 0.055);
      curCyan = lerp(curCyan, cfg.cyanBoost, 0.055);
      curMagenta = lerp(curMagenta, cfg.magentaBoost, 0.055);
      curGold = lerp(curGold, cfg.goldBoost, 0.065);
      curEmerald = lerp(curEmerald, cfg.emeraldBoost, 0.065);
      curError = lerp(curError, cfg.errorTint, 0.08);
      curWobble = lerp(curWobble, cfg.wobbleAmp, 0.08);
      curBounce = lerp(curBounce, cfg.bounceAmp, 0.07);
      curDim = lerp(curDim, cfg.dimFactor, 0.05);

      pointerRef.current.x = lerp(pointerRef.current.x, pointerRef.current.tx, 0.07);
      pointerRef.current.y = lerp(pointerRef.current.y, pointerRef.current.ty, 0.07);
      const pxTilt = pointerRef.current.x;
      const pyTilt = pointerRef.current.y;

      // Reactive voice amplitude (live mic or real Gemini TTS waveform)
      let targetAmp = 0.06;
      if (st === 'listening') {
        const mic = Math.max(0, Math.min(100, audioLevelRef.current || 0)) / 100;
        targetAmp = 0.16 + mic * 0.84;
      } else if (st === 'speaking') {
        const realAudio = Math.max(0, Math.min(100, audioLevelRef.current || 0)) / 100;
        if (realAudio > 0.03) {
          targetAmp = 0.2 + realAudio * 0.8;
        } else {
          targetAmp =
            0.28 +
            Math.abs(Math.sin(time * 2.5)) * 0.32 +
            Math.abs(Math.cos(time * 4.2)) * 0.16;
        }
      } else if (
        st === 'thinking' ||
        st === 'understanding' ||
        st === 'transcribing' ||
        st === 'deep_thinking'
      ) {
        targetAmp = 0.22 + Math.sin(time * 2.0) * 0.08;
      } else if (st === 'happy' || st === 'encouraging') {
        targetAmp = 0.24 + Math.sin(time * 2.6) * 0.07;
      } else if (st === 'analyzing' || st === 'correcting') {
        targetAmp = 0.16 + Math.sin(time * 1.8) * 0.05;
      } else if (st === 'sleeping') {
        targetAmp = 0.02 + Math.sin(time * 0.5) * 0.015;
      } else {
        targetAmp = 0.07 + Math.sin(time * 1.0) * 0.035;
      }

      smoothAmp = lerp(smoothAmp, targetAmp, 0.13);
      time += curRibbonSpeed * (1 + smoothAmp * 0.55);
      ringPhase += curRingSpeed * (1 + smoothAmp * 0.65);

      const wobbleX = curWobble > 0.05 ? Math.sin(time * 7.2) * curWobble * Math.cos(time * 3.0) : 0;
      const bounceY = curBounce > 0.05 ? -Math.abs(Math.sin(time * 2.4)) * curBounce : 0;

      const cx = size / 2 + wobbleX;
      const cy = size / 2 + bounceY;
      // Sphere radius sized so layered outer translucent energy rings breathe gracefully inside canvas
      const R = size * 0.305 + smoothAmp * (size * 0.014);
      const ringScale = 1 + curRingExpand + smoothAmp * 0.055;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.globalAlpha = curDim;

      // -------------------------------------------------------------
      // 1. SOFT AIRY ATMOSPHERIC BACK-GLOW (Tasteful blue-violet aura for light surfaces)
      // -------------------------------------------------------------
      const softAura = ctx.createRadialGradient(
        cx - R * 0.12,
        cy + R * 0.08,
        R * 0.55,
        cx,
        cy,
        R * 1.56
      );
      softAura.addColorStop(0, `rgba(96, 165, 250, ${0.26 * curHalo})`);
      softAura.addColorStop(0.52, `rgba(167, 139, 250, ${0.14 * curHalo * curMagenta})`);
      softAura.addColorStop(1, 'rgba(238, 242, 255, 0)');
      ctx.fillStyle = softAura;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.56, 0, Math.PI * 2);
      ctx.fill();

      // Subtle state accent aura (Gold on Encouraging, Emerald on Correcting)
      if (curGold > 0.03) {
        const goldHalo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.5);
        goldHalo.addColorStop(0, `rgba(251, 191, 36, ${0.24 * curGold})`);
        goldHalo.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = goldHalo;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (curEmerald > 0.03) {
        const emHalo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.48);
        emHalo.addColorStop(0, `rgba(16, 185, 129, ${0.22 * curEmerald})`);
        emHalo.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = emHalo;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.48, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 1B. LAYERED TRANSLUCENT OUTER GLASS-SILK ENERGY RINGS (Signature Reference Identity!)
      // -------------------------------------------------------------
      const driftA = Math.sin(ringPhase * 1.1) * 0.14;
      const driftB = Math.cos(ringPhase * 0.9) * 0.16;

      // Outer Veil 1: Sweeping Sky-Cyan & Ice-Blue Glass Shell (Left-Bottom emphasis)
      drawOuterGlassShell(
        cx - R * 0.06 - pxTilt * 5,
        cy + R * 0.02 - pyTilt * 5,
        R * 1.42 * ringScale,
        R * 1.16 * ringScale,
        -0.32 + driftA,
        `rgba(56, 189, 248, ${0.24 * curCyan})`,
        `rgba(147, 197, 253, ${0.1 * curCyan})`,
        `rgba(196, 181, 253, ${0.12 * curMagenta})`,
        `rgba(186, 230, 253, ${0.9 * curCyan})`,
        `rgba(245, 208, 254, ${0.65 * curMagenta})`,
        1.6
      );

      // Outer Veil 2: Counter-Sweeping Lavender-Rose & Periwinkle Glass Shell (Right-Top emphasis)
      drawOuterGlassShell(
        cx + R * 0.07 + pxTilt * 4,
        cy - R * 0.02 + pyTilt * 4,
        R * 1.38 * ringScale,
        R * 1.1 * ringScale,
        0.34 + driftB,
        `rgba(129, 140, 248, ${0.12 * curCyan})`,
        `rgba(192, 132, 252, ${0.12 * curMagenta})`,
        `rgba(244, 114, 182, ${0.22 * curMagenta})`,
        `rgba(224, 242, 254, ${0.72 * curCyan})`,
        `rgba(251, 207, 232, ${0.88 * curMagenta})`,
        1.45
      );

      // Inner Sweeping Energy Orbit Ring (Delicate pearlescent elliptical ribbon)
      drawOuterGlassShell(
        cx + pxTilt * 2.5,
        cy + R * 0.05 + pyTilt * 2.5,
        R * 1.3 * ringScale,
        R * 0.86 * ringScale,
        -0.14 + Math.sin(ringPhase * 1.4) * 0.18,
        `rgba(56, 189, 248, ${0.1 * curCyan})`,
        'rgba(255, 255, 255, 0.04)',
        `rgba(217, 70, 239, ${0.12 * curMagenta})`,
        `rgba(125, 211, 252, ${0.75 * curCyan})`,
        `rgba(232, 121, 249, ${0.72 * curMagenta})`,
        1.15
      );

      // Reactive expanding sound-wave ripples during Listening / Speaking / Correcting
      if (st === 'listening' || st === 'speaking' || st === 'correcting') {
        for (let w = 0; w < 2; w++) {
          const p = (time * 0.55 + w * 0.5) % 1;
          const wr = R * (1.06 + p * 0.44);
          ctx.save();
          ctx.strokeStyle =
            st === 'listening'
              ? `rgba(14, 165, 233, ${(1 - p) * (0.34 + smoothAmp * 0.3)})`
              : st === 'correcting'
                ? `rgba(16, 185, 129, ${(1 - p) * 0.36})`
                : `rgba(168, 85, 247, ${(1 - p) * (0.3 + smoothAmp * 0.28)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, wr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Orbiting dashed / layered rings during Understanding / Analyzing / Deep Thinking
      if (st === 'understanding' || st === 'analyzing' || st === 'deep_thinking' || st === 'thinking') {
        const ringCount = st === 'deep_thinking' ? 3 : 2;
        for (let r = 0; r < ringCount; r++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(ringPhase * (1.4 + r * 0.55) * (r % 2 === 0 ? 1 : -1) + r * 0.85);
          ctx.strokeStyle =
            st === 'analyzing'
              ? `rgba(16, 185, 129, ${0.38 - r * 0.08})`
              : st === 'deep_thinking'
                ? `rgba(147, 51, 234, ${0.38 - r * 0.07})`
                : `rgba(59, 130, 246, ${0.36 - r * 0.08})`;
          ctx.lineWidth = st === 'analyzing' ? 1.15 : 1.3;
          if (st === 'analyzing') ctx.setLineDash([5, 7]);
          ctx.beginPath();
          ctx.ellipse(0, 0, R * (1.2 + r * 0.09), R * (0.5 + r * 0.14), 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Subtle floating outer stardust motes inside the outer glass rings
      ctx.save();
      for (const m of outerMotes) {
        m.angle += curStarSpeed * m.speed * 1.4;
        const cosT = Math.cos(m.tilt);
        const sinT = Math.sin(m.tilt);
        const lx = Math.cos(m.angle) * R * m.orbitRx * ringScale;
        const ly = Math.sin(m.angle) * R * m.orbitRy * ringScale;
        const mx = cx + lx * cosT - ly * sinT;
        const my = cy + lx * sinT + ly * cosT;
        const distFromCenter = Math.hypot(mx - cx, my - cy);
        if (distFromCenter < R * 1.03) continue; // Keep outer motes outside sphere rim
        const tw = 0.35 + 0.65 * Math.sin(time * 2.4 + m.phase);
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, m.size * 2.6);
        mg.addColorStop(0, m.color);
        mg.addColorStop(0.45, m.color);
        mg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = tw * 0.85;
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 2. CLIP INSIDE THE LIVING CRYSTAL SPHERE
      // -------------------------------------------------------------
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // 2A. Rich Midnight-Sapphire to Royal-Indigo Crystal Core (Reference Upper Depth)
      const coreGrad = ctx.createRadialGradient(
        cx - R * 0.2 + pxTilt * 8,
        cy - R * 0.25 + pyTilt * 8,
        R * 0.08,
        cx,
        cy,
        R * 1.05
      );
      coreGrad.addColorStop(0, '#07153d');
      coreGrad.addColorStop(0.42, '#0b1e59');
      coreGrad.addColorStop(0.76, '#1d4ed8');
      coreGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // 2B. Diagonal Electric-Cyan & Cobalt Luminous Nebula Pool (Left-Center -> Mid-Right)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const cyanLeftGlow = ctx.createRadialGradient(
        cx - R * 0.56 + pxTilt * 7,
        cy + R * 0.16 + pyTilt * 5,
        R * 0.06,
        cx - R * 0.32,
        cy + R * 0.12,
        R * 0.86
      );
      cyanLeftGlow.addColorStop(0, `rgba(56, 189, 248, ${0.95 * curCyan})`);
      cyanLeftGlow.addColorStop(0.45, `rgba(14, 165, 233, ${0.65 * curCyan})`);
      cyanLeftGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cyanLeftGlow;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // 2C. Radiant Lower-Hemisphere Orchid-Magenta & Violet Plasma (Signature Reference Lower Glow)
      const magentaPool = ctx.createRadialGradient(
        cx + R * 0.12 - pxTilt * 6,
        cy + R * 0.72 - pyTilt * 5,
        R * 0.06,
        cx + R * 0.08,
        cy + R * 0.54,
        R * 0.96
      );
      magentaPool.addColorStop(0, `rgba(244, 114, 182, ${0.96 * curMagenta})`);
      magentaPool.addColorStop(0.36, `rgba(217, 70, 239, ${0.84 * curMagenta})`);
      magentaPool.addColorStop(0.68, `rgba(139, 92, 246, ${0.52 * curMagenta})`);
      magentaPool.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = magentaPool;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // Soft Back-Pass Diagonal Sapphire Wave (blurred deeply behind stars)
      drawInternalNebulaWave(cx, cy, R, {
        yOffsetA: 0.42,
        yOffsetB: -0.18,
        ctrlY1: 0.12,
        ctrlY2: -0.05,
        thickness: 0.34,
        phaseShift: 1.1,
        waveAmp: 5 + smoothAmp * 12,
        colors: [
          `rgba(14, 165, 233, ${0.85 * curCyan})`,
          `rgba(37, 99, 235, ${0.92 * curCyan})`,
          `rgba(99, 102, 241, ${0.78 * curMagenta})`
        ],
        ridgeColor: 'rgba(186, 230, 253, 0.88)',
        alpha: 0.85,
        tiltX: -pxTilt * 0.4,
        tiltY: -pyTilt * 0.4,
        blurPx: 8.5
      });

      // Front-Pass Luminous Electric-Cyan Diagonal Nebula Band (Smooth & Dreamy!)
      drawInternalNebulaWave(cx, cy, R, {
        yOffsetA: 0.32,
        yOffsetB: -0.26,
        ctrlY1: 0.24,
        ctrlY2: -0.1,
        thickness: 0.24,
        phaseShift: 2.6,
        waveAmp: 4.5 + smoothAmp * 14,
        colors: [
          `rgba(34, 211, 238, ${0.9 * curCyan})`,
          `rgba(59, 130, 246, ${0.88 * curCyan})`,
          `rgba(56, 189, 248, ${0.85 * curCyan})`
        ],
        ridgeColor: 'rgba(224, 242, 254, 0.92)',
        alpha: 0.82,
        tiltX: pxTilt * 0.9,
        tiltY: pyTilt * 0.9,
        blurPx: 5.5
      });

      // Lower Violet-Magenta Silky Mist Sweep
      drawInternalNebulaWave(cx, cy, R, {
        yOffsetA: 0.62,
        yOffsetB: 0.16,
        ctrlY1: 0.72,
        ctrlY2: 0.48,
        thickness: 0.26,
        phaseShift: 4.3,
        waveAmp: 4 + smoothAmp * 10,
        colors: [
          `rgba(168, 85, 247, ${0.78 * curMagenta})`,
          `rgba(217, 70, 239, ${0.88 * curMagenta})`,
          `rgba(244, 114, 182, ${0.85 * curMagenta})`
        ],
        ridgeColor: 'rgba(250, 232, 255, 0.75)',
        alpha: 0.78,
        tiltX: pxTilt * 0.65,
        tiltY: pyTilt * 0.65,
        blurPx: 7.0
      });

      if (curError > 0.02) {
        ctx.fillStyle = `rgba(244, 63, 94, ${curError * 0.32})`;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 2D. FLOATING INTERNAL 3D BOKEH STARDUST PARTICLES
      // -------------------------------------------------------------
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const s of stars) {
        s.theta += curStarSpeed * s.speedTheta * (1 + smoothAmp * 1.2);
        s.phi += curStarSpeed * s.speedPhi * 0.32;

        const pull = st === 'transcribing' ? 0.78 + Math.sin(time * 2 + s.twinkleOffset) * 0.12 : 1.0;
        const sr = R * s.radiusFrac * pull;

        const sinPhi = Math.sin(s.phi);
        const x3d = sr * sinPhi * Math.cos(s.theta);
        const y3d = sr * Math.cos(s.phi);
        const z3d = sr * sinPhi * Math.sin(s.theta);

        const depth = (z3d + R) / (2 * R);
        const sx = cx + x3d + pxTilt * (depth - 0.5) * 20;
        const sy = cy + y3d + pyTilt * (depth - 0.5) * 20;

        const twinkle = 0.45 + 0.55 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
        const alpha = (0.24 + depth * 0.76) * twinkle;
        const radius = s.size * (0.65 + depth * 0.7) * (1 + smoothAmp * 0.18);

        if (s.bokeh || radius > 1.7) {
          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 3.1);
          sg.addColorStop(0, '#ffffff');
          sg.addColorStop(0.28, s.color);
          sg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = alpha * 0.9;
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 3.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 2E. INTERNAL CURVED CRYSTAL MENISCUS & FROSTED GLASS MICRO-GRAIN
      // -------------------------------------------------------------
      // Smooth curved internal crystal arch in the upper hemisphere (exact glass refraction depth!)
      ctx.save();
      ctx.translate(cx - R * 0.02 + pxTilt * 4, cy - R * 0.18 + pyTilt * 4);
      ctx.rotate(-0.22);
      const archGrad = ctx.createLinearGradient(0, -R * 0.52, 0, R * 0.05);
      archGrad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
      archGrad.addColorStop(0.45, 'rgba(186, 230, 253, 0.14)');
      archGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = archGrad;
      ctx.beginPath();
      ctx.ellipse(0, -R * 0.18, R * 0.64, R * 0.36, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(224, 242, 254, 0.42)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, -R * 0.12, R * 0.62, R * 0.34, 0, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
      ctx.restore();

      // Translucent Frosted Crystal Glass Dome Veil + Fine Crystalline Micro-Grain
      ctx.save();
      const glassFrostVeil = ctx.createRadialGradient(
        cx - R * 0.1 + pxTilt * 4,
        cy - R * 0.2 + pyTilt * 4,
        R * 0.1,
        cx,
        cy,
        R
      );
      glassFrostVeil.addColorStop(0, 'rgba(248, 251, 255, 0.12)');
      glassFrostVeil.addColorStop(0.55, 'rgba(219, 234, 254, 0.08)');
      glassFrostVeil.addColorStop(0.84, 'rgba(224, 242, 254, 0.22)');
      glassFrostVeil.addColorStop(1, 'rgba(255, 255, 255, 0.52)');
      ctx.fillStyle = glassFrostVeil;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      if (noisePattern) {
        ctx.save();
        ctx.translate(cx - R + pxTilt * 2.5, cy - R + pyTilt * 2.5);
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.24;
        ctx.fillStyle = noisePattern;
        ctx.fillRect(-16, -16, R * 2 + 32, R * 2 + 32);

        ctx.globalCompositeOperation = 'soft-light';
        ctx.globalAlpha = 0.18;
        ctx.fillRect(-16, -16, R * 2 + 32, R * 2 + 32);
        ctx.restore();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 2F. OVERHEAD STUDIO GLASS DOME SPECULAR & BOTTOM PINK CAUSTIC STAR
      // -------------------------------------------------------------
      // Primary crisp top-dome white studio reflection (signature crystal lens pop!)
      ctx.save();
      ctx.translate(cx + R * 0.02 + pxTilt * 5, cy - R * 0.58 + pyTilt * 5);
      ctx.rotate(-0.12);
      const topSpec = ctx.createRadialGradient(0, -R * 0.06, R * 0.02, 0, 0, R * 0.62);
      topSpec.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
      topSpec.addColorStop(0.24, 'rgba(240, 249, 255, 0.72)');
      topSpec.addColorStop(0.55, 'rgba(186, 230, 253, 0.22)');
      topSpec.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = topSpec;
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.68, R * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Bottom-center radiant pink-white caustic star (signature reference sparkle!)
      ctx.save();
      const bx = cx + R * 0.03 - pxTilt * 4;
      const by = cy + R * 0.78 - pyTilt * 3;
      const botStar = ctx.createRadialGradient(bx, by, R * 0.02, bx, by, R * 0.52);
      botStar.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
      botStar.addColorStop(0.22, 'rgba(253, 242, 248, 0.78)');
      botStar.addColorStop(0.52, `rgba(232, 121, 249, ${0.42 * curMagenta})`);
      botStar.addColorStop(1, 'rgba(232, 121, 249, 0)');
      ctx.fillStyle = botStar;
      ctx.beginPath();
      ctx.arc(bx, by, R * 0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner Pearlescent Fresnel Glass Thickness Wall
      const fresnel = ctx.createRadialGradient(cx, cy, R * 0.76, cx, cy, R);
      fresnel.addColorStop(0, 'rgba(255, 255, 255, 0)');
      fresnel.addColorStop(0.68, 'rgba(186, 230, 253, 0.16)');
      fresnel.addColorStop(0.9, 'rgba(240, 249, 255, 0.55)');
      fresnel.addColorStop(1, 'rgba(255, 255, 255, 0.92)');
      ctx.fillStyle = fresnel;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // End Sphere Clip

      // -------------------------------------------------------------
      // 3. PEARLESCENT CRYSTAL SPHERE RIM RING
      // -------------------------------------------------------------
      const rimGrad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      rimGrad.addColorStop(0.35, 'rgba(186, 230, 253, 0.92)');
      rimGrad.addColorStop(0.7, 'rgba(196, 181, 253, 0.9)');
      rimGrad.addColorStop(1, 'rgba(251, 207, 232, 0.95)');

      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore(); // End global dimFactor save

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [size, audioLevelRef]);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    pointerRef.current.tx = Math.max(-1, Math.min(1, nx));
    pointerRef.current.ty = Math.max(-1, Math.min(1, ny));
  };

  const handlePointerLeave = () => {
    pointerRef.current.tx = 0;
    pointerRef.current.ty = 0;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group relative flex items-center justify-center focus:outline-none cursor-pointer select-none rounded-full"
      aria-label={`Lingo Buddy living crystal orb (${state})`}
      title={state === 'speaking' ? 'Tap to interrupt and speak' : 'Tap to speak or pause'}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="transition-transform duration-500 ease-out group-hover:scale-[1.025] group-active:scale-[0.98]"
      />
    </button>
  );
};
