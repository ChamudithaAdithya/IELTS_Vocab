import React, { useEffect, useRef } from 'react';
import type { BuddyOrbState } from '../../types/speakingBuddy';

export interface BuddyEnergyOrbProps {
  state: BuddyOrbState;
  /** Mutable ref holding live mic amplitude (0–100) so 60 FPS rendering stays decoupled from React state */
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
  blur: boolean;
}

interface StateMotionConfig {
  ribbonSpeed: number;
  starSpeed: number;
  waveBoost: number;
  haloIntensity: number;
  magentaBoost: number;
  cyanBoost: number;
  errorTint: number;
}

const STATE_MOTION: Record<BuddyOrbState, StateMotionConfig> = {
  idle: {
    ribbonSpeed: 0.011,
    starSpeed: 0.0045,
    waveBoost: 0.14,
    haloIntensity: 0.75,
    magentaBoost: 1.0,
    cyanBoost: 1.0,
    errorTint: 0
  },
  listening: {
    ribbonSpeed: 0.024,
    starSpeed: 0.011,
    waveBoost: 0.45,
    haloIntensity: 1.15,
    magentaBoost: 0.95,
    cyanBoost: 1.35,
    errorTint: 0
  },
  transcribing: {
    ribbonSpeed: 0.036,
    starSpeed: 0.018,
    waveBoost: 0.36,
    haloIntensity: 1.05,
    magentaBoost: 1.2,
    cyanBoost: 1.25,
    errorTint: 0
  },
  understanding: {
    ribbonSpeed: 0.042,
    starSpeed: 0.02,
    waveBoost: 0.4,
    haloIntensity: 1.1,
    magentaBoost: 1.25,
    cyanBoost: 1.2,
    errorTint: 0
  },
  thinking: {
    ribbonSpeed: 0.052,
    starSpeed: 0.024,
    waveBoost: 0.48,
    haloIntensity: 1.2,
    magentaBoost: 1.35,
    cyanBoost: 1.15,
    errorTint: 0
  },
  speaking: {
    ribbonSpeed: 0.038,
    starSpeed: 0.014,
    waveBoost: 0.52,
    haloIntensity: 1.25,
    magentaBoost: 1.2,
    cyanBoost: 1.35,
    errorTint: 0
  },
  correcting: {
    ribbonSpeed: 0.022,
    starSpeed: 0.009,
    waveBoost: 0.28,
    haloIntensity: 1.0,
    magentaBoost: 1.15,
    cyanBoost: 1.25,
    errorTint: 0
  },
  error: {
    ribbonSpeed: 0.02,
    starSpeed: 0.006,
    waveBoost: 0.22,
    haloIntensity: 1.0,
    magentaBoost: 1.3,
    cyanBoost: 0.5,
    errorTint: 0.75
  },
  sleeping: {
    ribbonSpeed: 0.004,
    starSpeed: 0.0015,
    waveBoost: 0.05,
    haloIntensity: 0.35,
    magentaBoost: 0.6,
    cyanBoost: 0.6,
    errorTint: 0
  }
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Photorealistic Living Crystal-Galaxy Energy Orb (60 FPS 3D-Projected Canvas).
 * Recreates the obsidian-black deep-space core, sweeping translucent electric-blue/cyan/magenta
 * 3D silk ribbons, twinkling internal stardust galaxy, iridescent chromatic edge refraction,
 * and glossy overhead studio glass reflections — alive with voice reactivity & cursor parallax.
 */
export const BuddyEnergyOrb: React.FC<BuddyEnergyOrbProps> = ({
  state,
  audioLevelRef,
  onClick,
  size = 320
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

    // Seed 92 3D stardust particles inside the deep obsidian sphere core
    const starPalette = ['#ffffff', '#7dd3fc', '#38bdf8', '#c4b5fd', '#f0abfc', '#e0f2fe'];
    const stars: StarParticle[] = Array.from({ length: 92 }, (_, i) => ({
      theta: ((i * 137.508) % 360) * (Math.PI / 180),
      phi: Math.acos(1 - (2 * ((i + 0.5) / 92))),
      radiusFrac: 0.16 + ((i * 31) % 76) / 100,
      speedTheta: (0.45 + (i % 7) * 0.14) * (i % 2 === 0 ? 1 : -0.7),
      speedPhi: (0.2 + (i % 5) * 0.08) * (i % 3 === 0 ? 1 : -1),
      size: i % 9 === 0 ? 2.5 : i % 4 === 0 ? 1.7 : 1.05,
      twinkleOffset: i * 0.73,
      twinkleSpeed: 1.6 + (i % 5) * 0.55,
      color: starPalette[i % starPalette.length],
      blur: i % 5 === 0
    }));

    let rafId = 0;
    let time = 0;
    let smoothAmp = 0.08;
    let curRibbonSpeed = STATE_MOTION.idle.ribbonSpeed;
    let curStarSpeed = STATE_MOTION.idle.starSpeed;
    let curHalo = STATE_MOTION.idle.haloIntensity;
    let curCyan = 1.0;
    let curMagenta = 1.0;
    let curError = 0;

    // Helper: draw a lush translucent curved 3D silk ribbon sweeping diagonally across the sphere
    const drawSweepingRibbon = (
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
      }
    ) => {
      const steps = 42;
      const topPts: [number, number][] = [];
      const botPts: [number, number][] = [];

      const xStart = cx - R * 1.18 + opts.tiltX * 14;
      const xEnd = cx + R * 1.18 + opts.tiltX * 14;

      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        // Cubic Bezier curve spine across the sphere
        const inv = 1 - u;
        const x = lerp(xStart, xEnd, u);
        const y0 = cy + opts.yOffsetA * R + opts.tiltY * 14;
        const y1 = cy + opts.ctrlY1 * R + opts.tiltY * 14;
        const y2 = cy + opts.ctrlY2 * R + opts.tiltY * 14;
        const y3 = cy + opts.yOffsetB * R + opts.tiltY * 14;

        const spineY =
          inv * inv * inv * y0 +
          3 * inv * inv * u * y1 +
          3 * inv * u * u * y2 +
          u * u * u * y3;

        // Living harmonic liquid wave along the ribbon spine
        const ripple =
          Math.sin(u * Math.PI * 2.5 - time * 1.7 + opts.phaseShift) * opts.waveAmp +
          Math.cos(u * Math.PI * 4.2 + time * 1.2 + opts.phaseShift) * (opts.waveAmp * 0.45);

        // Pinched organic silk thickness (tapers near edges, swells through mid-sweep)
        const swell = 0.35 + Math.sin(u * Math.PI) * 0.85 + Math.sin(u * Math.PI * 2 + time) * 0.16;
        const halfH = opts.thickness * R * swell;

        topPts.push([x, spineY + ripple - halfH * 0.55]);
        botPts.push([x, spineY + ripple + halfH]);
      }

      // Fill silk ribbon body with multi-stop luminous gradient
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        if (i === 0) ctx.moveTo(topPts[i][0], topPts[i][1]);
        else ctx.lineTo(topPts[i][0], topPts[i][1]);
      }
      for (let i = steps; i >= 0; i--) {
        ctx.lineTo(botPts[i][0], botPts[i][1]);
      }
      ctx.closePath();

      const grad = ctx.createLinearGradient(xStart, cy + R * 0.4, xEnd, cy - R * 0.4);
      grad.addColorStop(0, opts.colors[0]);
      grad.addColorStop(0.5, opts.colors[1]);
      grad.addColorStop(1, opts.colors[2]);
      ctx.globalAlpha = opts.alpha;
      ctx.fillStyle = grad;
      ctx.fill();

      // Razor-bright inner plasma ridge along the upper edge of the ribbon
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        if (i === 0) ctx.moveTo(topPts[i][0], topPts[i][1]);
        else ctx.lineTo(topPts[i][0], topPts[i][1]);
      }
      ctx.strokeStyle = opts.ridgeColor;
      ctx.lineWidth = 1.65;
      ctx.globalAlpha = Math.min(1, opts.alpha * 1.15);
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      const st = stateRef.current;
      const cfg = STATE_MOTION[st] || STATE_MOTION.idle;

      curRibbonSpeed = lerp(curRibbonSpeed, cfg.ribbonSpeed, 0.06);
      curStarSpeed = lerp(curStarSpeed, cfg.starSpeed, 0.06);
      curHalo = lerp(curHalo, cfg.haloIntensity, 0.06);
      curCyan = lerp(curCyan, cfg.cyanBoost, 0.06);
      curMagenta = lerp(curMagenta, cfg.magentaBoost, 0.06);
      curError = lerp(curError, cfg.errorTint, 0.08);

      // Smooth cursor parallax
      pointerRef.current.x = lerp(pointerRef.current.x, pointerRef.current.tx, 0.08);
      pointerRef.current.y = lerp(pointerRef.current.y, pointerRef.current.ty, 0.08);
      const pxTilt = pointerRef.current.x;
      const pyTilt = pointerRef.current.y;

      // Living voice amplitude tracking
      let targetAmp = 0.08;
      if (st === 'listening') {
        const mic = Math.max(0, Math.min(100, audioLevelRef.current || 0)) / 100;
        targetAmp = 0.18 + mic * 0.82;
      } else if (st === 'speaking') {
        targetAmp =
          0.32 +
          Math.abs(Math.sin(time * 2.8)) * 0.35 +
          Math.abs(Math.cos(time * 4.7)) * 0.18;
      } else if (st === 'thinking' || st === 'understanding' || st === 'transcribing') {
        targetAmp = 0.25 + Math.sin(time * 2.3) * 0.1;
      } else if (st === 'sleeping') {
        targetAmp = 0.02;
      } else {
        targetAmp = 0.09 + Math.sin(time * 1.1) * 0.04;
      }

      smoothAmp = lerp(smoothAmp, targetAmp, 0.14);
      time += curRibbonSpeed * (1 + smoothAmp * 0.7);

      const cx = size / 2;
      const cy = size / 2;
      // Subtle organic breath scale
      const R = size * 0.345 + smoothAmp * (size * 0.018);

      ctx.clearRect(0, 0, size, size);

      // -------------------------------------------------------------
      // 1. OUTER LUMINOUS ATMOSPHERIC HALO (Electric Blue + Bottom Magenta)
      // -------------------------------------------------------------
      const haloBlue = ctx.createRadialGradient(
        cx - R * 0.18,
        cy - R * 0.1,
        R * 0.65,
        cx,
        cy,
        R * 1.44
      );
      haloBlue.addColorStop(0, `rgba(37, 99, 235, ${0.34 * curHalo})`);
      haloBlue.addColorStop(0.5, `rgba(56, 189, 248, ${0.14 * curHalo})`);
      haloBlue.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloBlue;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.44, 0, Math.PI * 2);
      ctx.fill();

      const haloPink = ctx.createRadialGradient(
        cx + R * 0.2,
        cy + R * 0.38,
        R * 0.3,
        cx + R * 0.1,
        cy + R * 0.25,
        R * 1.28
      );
      haloPink.addColorStop(0, `rgba(217, 70, 239, ${0.34 * curHalo * curMagenta})`);
      haloPink.addColorStop(0.55, `rgba(168, 85, 247, ${0.12 * curHalo})`);
      haloPink.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloPink;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.38, 0, Math.PI * 2);
      ctx.fill();

      // Subtle living sound-wave rings radiating softly outside glass when listening / speaking
      if (st === 'listening' || st === 'speaking') {
        for (let w = 0; w < 2; w++) {
          const p = (time * 0.48 + w * 0.5) % 1;
          const wr = R * (1.01 + p * 0.32);
          ctx.save();
          ctx.strokeStyle =
            st === 'listening'
              ? `rgba(56, 189, 248, ${(1 - p) * (0.28 + smoothAmp * 0.3)})`
              : `rgba(217, 70, 239, ${(1 - p) * (0.26 + smoothAmp * 0.28)})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(cx, cy, wr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // 2. CLIP INSIDE THE CRYSTAL SPHERE
      // -------------------------------------------------------------
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // 2A. Deep Obsidian Space Core (exact high-contrast dark core from reference!)
      const coreGrad = ctx.createRadialGradient(
        cx + pxTilt * 10,
        cy + pyTilt * 10,
        R * 0.08,
        cx,
        cy,
        R
      );
      coreGrad.addColorStop(0, '#020410');
      coreGrad.addColorStop(0.58, '#04081c');
      coreGrad.addColorStop(0.84, '#0c1a4b');
      coreGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // 2B. Iridescent Far-Left Emerald-Cyan Glass Refraction Glint (exact match to left edge of reference!)
      const leftIridescent = ctx.createRadialGradient(
        cx - R * 0.86,
        cy - R * 0.04,
        R * 0.05,
        cx - R * 0.72,
        cy,
        R * 0.56
      );
      leftIridescent.addColorStop(0, 'rgba(52, 211, 153, 0.52)');
      leftIridescent.addColorStop(0.35, 'rgba(132, 204, 22, 0.24)');
      leftIridescent.addColorStop(0.7, 'rgba(56, 189, 248, 0.16)');
      leftIridescent.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = leftIridescent;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // 2C. Back-Pass Deep Cobalt Ribbon (behind stardust for genuine 3D depth)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      drawSweepingRibbon(cx, cy, R, {
        yOffsetA: 0.34,
        yOffsetB: 0.16,
        ctrlY1: 0.22,
        ctrlY2: 0.42,
        thickness: 0.26,
        phaseShift: 1.4,
        waveAmp: 6 + smoothAmp * 14,
        colors: ['rgba(37, 99, 235, 0.65)', 'rgba(29, 78, 216, 0.88)', 'rgba(147, 51, 234, 0.78)'],
        ridgeColor: 'rgba(96, 165, 250, 0.85)',
        alpha: 0.82,
        tiltX: -pxTilt * 0.5,
        tiltY: -pyTilt * 0.5
      });

      // Lower-hemisphere glowing magenta / pink plasma pool
      const bottomPinkGlow = ctx.createRadialGradient(
        cx + R * 0.06,
        cy + R * 0.86,
        R * 0.05,
        cx,
        cy + R * 0.58,
        R * 0.92
      );
      bottomPinkGlow.addColorStop(0, `rgba(244, 114, 182, ${0.88 * curMagenta})`);
      bottomPinkGlow.addColorStop(0.35, `rgba(217, 70, 239, ${0.58 * curMagenta})`);
      bottomPinkGlow.addColorStop(0.7, `rgba(59, 130, 246, ${0.28 * curCyan})`);
      bottomPinkGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bottomPinkGlow;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // Right-mid electric cyan energy hotspot
      const rightCyanHot = ctx.createRadialGradient(
        cx + R * 0.78,
        cy + R * 0.02,
        R * 0.04,
        cx + R * 0.62,
        cy,
        R * 0.58
      );
      rightCyanHot.addColorStop(0, `rgba(34, 211, 238, ${0.9 * curCyan})`);
      rightCyanHot.addColorStop(0.45, `rgba(37, 99, 235, ${0.55 * curCyan})`);
      rightCyanHot.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rightCyanHot;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();

      // -------------------------------------------------------------
      // 2D. 3D FLOATING STARDUST / GALAXY PARTICLES INSIDE DARK CORE
      // -------------------------------------------------------------
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const s of stars) {
        s.theta += curStarSpeed * s.speedTheta * (1 + smoothAmp * 1.4);
        s.phi += curStarSpeed * s.speedPhi * 0.35;

        // Inward spiral pull while transcribing
        const pull = st === 'transcribing' ? 0.76 + Math.sin(time * 2 + s.twinkleOffset) * 0.14 : 1.0;
        const sr = R * s.radiusFrac * pull;

        const sinPhi = Math.sin(s.phi);
        const x3d = sr * sinPhi * Math.cos(s.theta);
        const y3d = sr * Math.cos(s.phi);
        const z3d = sr * sinPhi * Math.sin(s.theta);

        // Perspective projection + subtle cursor parallax
        const depth = (z3d + R) / (2 * R); // 0 (back) -> 1 (front)
        const sx = cx + x3d + pxTilt * (depth - 0.5) * 26;
        const sy = cy + y3d + pyTilt * (depth - 0.5) * 26;

        const twinkle = 0.42 + 0.58 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
        const alpha = (0.2 + depth * 0.8) * twinkle;
        const radius = s.size * (0.6 + depth * 0.75) * (1 + smoothAmp * 0.25);

        if (s.blur || radius > 1.8) {
          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 3.2);
          sg.addColorStop(0, s.color);
          sg.addColorStop(0.35, s.color);
          sg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = alpha * 0.85;
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 3.2, 0, Math.PI * 2);
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
      // 2E. FRONT-PASS TRANSLUCENT SILK / PLASMA RIBBONS (Iconic Reference Sweeps)
      // -------------------------------------------------------------
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Ribbon 1: Upper-left to upper-right iridescent glass-silk ribbon
      drawSweepingRibbon(cx, cy, R, {
        yOffsetA: 0.28,
        yOffsetB: -0.42,
        ctrlY1: -0.26,
        ctrlY2: -0.64,
        thickness: 0.16,
        phaseShift: 0.2,
        waveAmp: 5 + smoothAmp * 13,
        colors: ['rgba(56, 189, 248, 0.42)', 'rgba(129, 140, 248, 0.55)', 'rgba(224, 242, 254, 0.88)'],
        ridgeColor: 'rgba(224, 242, 254, 0.92)',
        alpha: 0.78,
        tiltX: pxTilt,
        tiltY: pyTilt
      });

      // Ribbon 2: Hero Diagonal Electric Cyan → Sapphire Plasma Wave (bottom-left to mid-right)
      drawSweepingRibbon(cx, cy, R, {
        yOffsetA: 0.38,
        yOffsetB: -0.18,
        ctrlY1: 0.08,
        ctrlY2: -0.12,
        thickness: 0.24,
        phaseShift: 2.3,
        waveAmp: 7 + smoothAmp * 18,
        colors: [
          `rgba(56, 189, 248, ${0.95 * curCyan})`,
          `rgba(37, 99, 235, ${0.9 * curCyan})`,
          `rgba(34, 211, 238, ${0.95 * curCyan})`
        ],
        ridgeColor: 'rgba(186, 230, 253, 0.96)',
        alpha: 0.92,
        tiltX: pxTilt * 1.15,
        tiltY: pyTilt * 1.15
      });

      // Ribbon 3: Crisp Sweeping Magenta-Violet Lower Curve
      drawSweepingRibbon(cx, cy, R, {
        yOffsetA: 0.55,
        yOffsetB: 0.26,
        ctrlY1: 0.88,
        ctrlY2: 0.68,
        thickness: 0.22,
        phaseShift: 4.1,
        waveAmp: 5 + smoothAmp * 12,
        colors: [
          `rgba(232, 121, 249, ${0.85 * curMagenta})`,
          `rgba(168, 85, 247, ${0.8 * curMagenta})`,
          `rgba(244, 114, 182, ${0.92 * curMagenta})`
        ],
        ridgeColor: 'rgba(250, 232, 255, 0.88)',
        alpha: 0.86,
        tiltX: pxTilt * 0.8,
        tiltY: pyTilt * 0.8
      });

      // Optional controlled error tint flash
      if (curError > 0.02) {
        ctx.fillStyle = `rgba(244, 63, 94, ${curError * 0.35})`;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 2F. ULTRA-GLOSSY CRYSTAL GLASS OVERHEAD STUDIO REFLECTIONS
      // -------------------------------------------------------------
      // Primary top-dome curved white/ice-blue specular sheen (signature look of reference orb!)
      ctx.save();
      ctx.translate(cx + R * 0.04 + pxTilt * 6, cy - R * 0.52 + pyTilt * 6);
      ctx.rotate(-0.18);
      const topSpec = ctx.createRadialGradient(0, -R * 0.14, R * 0.04, 0, 0, R * 0.72);
      topSpec.addColorStop(0, 'rgba(255, 255, 255, 0.94)');
      topSpec.addColorStop(0.28, 'rgba(224, 242, 254, 0.62)');
      topSpec.addColorStop(0.58, 'rgba(147, 197, 253, 0.18)');
      topSpec.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = topSpec;
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.76, R * 0.44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Secondary crisp crescent window reflection band on upper-left/top
      ctx.save();
      ctx.translate(cx - R * 0.22 + pxTilt * 4, cy - R * 0.42 + pyTilt * 4);
      ctx.rotate(-0.55);
      const subSpec = ctx.createLinearGradient(0, -R * 0.18, 0, R * 0.18);
      subSpec.addColorStop(0, 'rgba(255, 255, 255, 0.58)');
      subSpec.addColorStop(0.5, 'rgba(224, 242, 254, 0.12)');
      subSpec.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = subSpec;
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.42, R * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Bottom inner magenta/white bounce caustic inside lower glass rim
      ctx.save();
      ctx.translate(cx + R * 0.08 - pxTilt * 4, cy + R * 0.78 - pyTilt * 4);
      ctx.rotate(-0.15);
      const botSpec = ctx.createRadialGradient(0, 0, R * 0.03, 0, 0, R * 0.58);
      botSpec.addColorStop(0, 'rgba(255, 230, 255, 0.72)');
      botSpec.addColorStop(0.4, 'rgba(232, 121, 249, 0.35)');
      botSpec.addColorStop(1, 'rgba(232, 121, 249, 0)');
      ctx.fillStyle = botSpec;
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.62, R * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner Fresnel Glass Vignette (gives physical spherical thickness)
      const fresnel = ctx.createRadialGradient(cx, cy, R * 0.76, cx, cy, R);
      fresnel.addColorStop(0, 'rgba(255, 255, 255, 0)');
      fresnel.addColorStop(0.7, 'rgba(125, 211, 252, 0.16)');
      fresnel.addColorStop(0.92, 'rgba(224, 242, 254, 0.52)');
      fresnel.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
      ctx.fillStyle = fresnel;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // End Sphere Clip

      // -------------------------------------------------------------
      // 3. CHROMATIC GLASS RIM RING (Cyan Top/Left → Vivid Magenta Bottom/Right)
      // -------------------------------------------------------------
      const rimGrad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      rimGrad.addColorStop(0, 'rgba(186, 230, 253, 0.9)');
      rimGrad.addColorStop(0.32, 'rgba(255, 255, 255, 0.95)');
      rimGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.9)');
      rimGrad.addColorStop(0.85, 'rgba(232, 121, 249, 0.95)');
      rimGrad.addColorStop(1, 'rgba(244, 114, 182, 0.92)');

      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
      ctx.stroke();

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
      aria-label={`Lingo Buddy crystal orb (${state})`}
      title={state === 'speaking' ? 'Tap to interrupt and speak' : 'Tap to speak or pause'}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="transition-transform duration-500 ease-out group-hover:scale-[1.03] group-active:scale-[0.98]"
      />
    </button>
  );
};
