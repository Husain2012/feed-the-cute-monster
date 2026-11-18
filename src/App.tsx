/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { FoodBadgeSvg } from './components/FoodBadgeSvg';
import {
  drawBackdrop,
  drawFallingFood,
  drawFloatingTexts,
  drawMonsterAndBubble,
  drawParticles,
  type MonsterRenderState,
} from './game/renderer';
import { soundEngine } from './game/sound';
import {
  FOOD_CATALOG,
  type CloudItem,
  type FallingFood,
  type FloatingText,
  type FoodId,
  type GameState,
  type HudSnapshot,
  type Particle,
} from './game/types';

const STORAGE_KEY = 'feed_cute_monster_best_v1';
const MAX_HEARTS = 3;
const TARGET_GOAL = 3;
const CONFETTI_PALETTE = ['#FACC15', '#34D399', '#38BDF8', '#F97316', '#EF4444', '#84CC16'];
const PARTICLE_POOL_SIZE = 72;

function getInitialBestScore(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Math.max(0, Number(saved) || 0) : 0;
  } catch {
    return 0;
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [muted, setMuted] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const [hud, setHud] = useState<HudSnapshot>(() => ({
    score: 0,
    bestScore: getInitialBestScore(),
    hearts: MAX_HEARTS,
    maxHearts: MAX_HEARTS,
    level: 1,
    targetFood: 'apple',
    catchesForTarget: 0,
    targetGoal: TARGET_GOAL,
  }));

  // Mutable simulation state isolated from React re-renders for steady 60fps
  const simRef = useRef({
    state: 'TITLE_MENU' as GameState,
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    score: 0,
    bestScore: getInitialBestScore(),
    hearts: MAX_HEARTS,
    targetFood: 'apple' as FoodId,
    catchesForTarget: 0,
    nextFoodId: 1,
    spawnTimer: 0.35,
    elapsed: 0,
    shakeTimer: 0,
    shakeStrength: 0,
    bubblePulse: 0,
    heldLeft: false,
    heldRight: false,
    pointerActive: false,
    pointerX: typeof window !== 'undefined' ? window.innerWidth / 2 : 600,
    monster: {
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600,
      y: typeof window !== 'undefined' ? window.innerHeight - 94 : 706,
      width: 112,
      height: 94,
      vx: 0,
      squashX: 1,
      squashY: 1,
      mood: 'idle',
      moodTimer: 0,
      blinkTimer: 2.3,
      isBlinking: false,
      mouthOpenAmount: 0,
      lookX: 0,
      lookY: 0,
      bobPhase: 0,
    } as MonsterRenderState,
    clouds: [
      { x: 110, y: 92, scale: 1.0, speed: 14 },
      { x: 460, y: 142, scale: 0.78, speed: 10 },
      { x: 860, y: 86, scale: 1.15, speed: 16 },
    ] as CloudItem[],
    foods: [] as FallingFood[],
    particles: Array.from({ length: PARTICLE_POOL_SIZE }, (): Particle => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 6,
      color: '#FACC15',
      alpha: 0,
      life: 0,
      maxLife: 1,
      rotation: 0,
      spin: 0,
      shape: 'star',
    })),
    floatingTexts: [] as FloatingText[],
  });

  const syncHudSnapshot = useCallback(() => {
    const s = simRef.current;
    setHud({
      score: s.score,
      bestScore: s.bestScore,
      hearts: s.hearts,
      maxHearts: MAX_HEARTS,
      level: 1 + Math.floor(s.score / 5),
      targetFood: s.targetFood,
      catchesForTarget: s.catchesForTarget,
      targetGoal: TARGET_GOAL,
    });
  }, []);

  const pickNextTarget = useCallback((avoidCurrent: boolean): FoodId => {
    const s = simRef.current;
    const pool = avoidCurrent
      ? FOOD_CATALOG.filter((f) => f.id !== s.targetFood)
      : FOOD_CATALOG;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    s.targetFood = chosen.id;
    s.catchesForTarget = 0;
    return chosen.id;
  }, []);

  const startNewRound = useCallback(() => {
    const s = simRef.current;
    s.score = 0;
    s.hearts = MAX_HEARTS;
    s.foods = [];
    s.floatingTexts = [];
    for (const p of s.particles) p.active = false;
    s.spawnTimer = 0.25;
    s.shakeTimer = 0;
    s.monster.x = s.width / 2;
    s.monster.vx = 0;
    s.monster.squashX = 1;
    s.monster.squashY = 1;
    s.monster.mood = 'idle';
    s.monster.moodTimer = 0;
    s.pointerActive = false;

    pickNextTarget(false);
    s.state = 'PLAYING';
    setIsNewBest(false);
    setGameState('PLAYING');
    syncHudSnapshot();
    soundEngine.playStart();
  }, [pickNextTarget, syncHudSnapshot]);

  const togglePause = useCallback(() => {
    const s = simRef.current;
    if (s.state === 'PLAYING') {
      s.state = 'PAUSED';
      setGameState('PAUSED');
    } else if (s.state === 'PAUSED') {
      s.state = 'PLAYING';
      setGameState('PLAYING');
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  // Keyboard & Blur Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = simRef.current;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        s.heldLeft = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        s.heldRight = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (s.state === 'TITLE_MENU' || s.state === 'GAME_OVER') {
          startNewRound();
        } else if (s.state === 'PLAYING' || s.state === 'PAUSED') {
          togglePause();
        }
      }
      if (e.code === 'Enter') {
        if (s.state === 'TITLE_MENU' || s.state === 'GAME_OVER') {
          startNewRound();
        }
      }
      if (e.code === 'Escape' && (s.state === 'PLAYING' || s.state === 'PAUSED')) {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = simRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.heldLeft = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.heldRight = false;
    };

    const handleWindowBlur = () => {
      const s = simRef.current;
      s.heldLeft = false;
      s.heldRight = false;
      if (s.state === 'PLAYING') {
        s.state = 'PAUSED';
        setGameState('PAUSED');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [startNewRound, togglePause]);

  // Main 60fps Canvas Simulation & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const s = simRef.current;
      s.width = w;
      s.height = h;
      s.monster.y = h - 94;
      s.monster.x = Math.max(64, Math.min(w - 64, s.monster.x));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const emitParticles = (x: number, y: number, count: number) => {
      const pool = simRef.current.particles;
      let spawned = 0;
      for (let i = 0; i < pool.length && spawned < count; i++) {
        const p = pool[i];
        if (p.active) continue;
        const angle = (Math.PI * 2 * spawned) / count + (Math.random() - 0.5) * 0.45;
        const speed = 115 + Math.random() * 210;
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 95;
        p.size = 5 + Math.random() * 6;
        p.color = CONFETTI_PALETTE[Math.floor(Math.random() * CONFETTI_PALETTE.length)];
        p.maxLife = 0.65 + Math.random() * 0.35;
        p.life = p.maxLife;
        p.alpha = 1;
        p.rotation = Math.random() * Math.PI * 2;
        p.spin = (Math.random() - 0.5) * 9;
        p.shape = Math.random() > 0.3 ? 'star' : 'circle';
        spawned++;
      }
    };

    const spawnFallingFood = () => {
      const s = simRef.current;
      const level = 1 + Math.floor(s.score / 5);
      // Keep ~44% spawn bias for the requested food so kids always have fair action
      const isTarget = Math.random() < 0.44;
      const foodType = isTarget
        ? s.targetFood
        : FOOD_CATALOG[Math.floor(Math.random() * FOOD_CATALOG.length)].id;

      const radius = 25;
      const margin = 52;
      const x = margin + Math.random() * Math.max(40, s.width - margin * 2);
      const baseSpeed = 148 + Math.min(185, (level - 1) * 20);

      s.foods.push({
        id: s.nextFoodId++,
        type: foodType,
        x,
        y: -40,
        vy: baseSpeed + Math.random() * 44,
        radius,
        rotation: (Math.random() - 0.5) * 0.4,
        rotationSpeed: (Math.random() - 0.5) * 1.4,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: Math.random() < 0.4 ? 14 : 0,
      });
    };

    let rafId = 0;
    let lastNow = performance.now();

    const tick = (now: number) => {
      const rawDt = (now - lastNow) / 1000;
      lastNow = now;
      const dt = Math.min(rawDt, 0.05);

      const s = simRef.current;
      s.elapsed += dt;
      s.bubblePulse += dt * 4;

      // Drifting clouds run in all states for a lively meadow backdrop
      for (const cloud of s.clouds) {
        cloud.x += cloud.speed * dt;
        if (cloud.x - 100 > s.width) {
          cloud.x = -120;
        }
      }

      // Monster idle breathing & blinking
      const m = s.monster;
      m.bobPhase += dt * 3.1;
      m.blinkTimer -= dt;
      if (m.blinkTimer <= 0) {
        if (m.isBlinking) {
          m.isBlinking = false;
          m.blinkTimer = 2.2 + Math.random() * 2.4;
        } else {
          m.isBlinking = true;
          m.blinkTimer = 0.13;
        }
      }

      // Smooth squash-and-stretch recovery
      m.squashX += (1 - m.squashX) * Math.min(1, dt * 12);
      m.squashY += (1 - m.squashY) * Math.min(1, dt * 12);

      if (m.moodTimer > 0) {
        m.moodTimer -= dt;
        if (m.moodTimer <= 0) {
          m.mood = 'idle';
        }
      }

      if (s.shakeTimer > 0) {
        s.shakeTimer = Math.max(0, s.shakeTimer - dt);
      }

      if (s.state === 'PLAYING') {
        const prevX = m.x;
        const halfW = m.width * 0.48;
        const keyboardSpeed = 600;

        if (s.heldLeft && !s.heldRight) {
          m.x -= keyboardSpeed * dt;
          s.pointerActive = false;
        } else if (s.heldRight && !s.heldLeft) {
          m.x += keyboardSpeed * dt;
          s.pointerActive = false;
        } else if (s.pointerActive) {
          const deltaX = s.pointerX - m.x;
          m.x += deltaX * Math.min(1, dt * 16);
        }

        m.x = Math.max(halfW + 12, Math.min(s.width - halfW - 12, m.x));
        m.vx = (m.x - prevX) / Math.max(dt, 0.001);

        // Gentle progressive spawn cadence
        const level = 1 + Math.floor(s.score / 5);
        const spawnInterval = Math.max(0.55, 1.24 - (level - 1) * 0.09);
        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0) {
          spawnFallingFood();
          s.spawnTimer = spawnInterval;
        }

        let nearestTarget: FallingFood | null = null;
        let nearestDist = Infinity;

        for (let i = s.foods.length - 1; i >= 0; i--) {
          const item = s.foods[i];
          item.y += item.vy * dt;
          item.rotation += item.rotationSpeed * dt;
          if (item.swayAmp > 0) {
            item.swayPhase += dt * 2.8;
            item.x += Math.sin(item.swayPhase) * item.swayAmp * dt;
          }

          const dx = item.x - m.x;
          const dy = item.y - (m.y - 12);
          const dist = Math.hypot(dx, dy);

          if (item.type === s.targetFood && dist < nearestDist) {
            nearestDist = dist;
            nearestTarget = item;
          }

          // Catch collision check
          if (
            Math.abs(dx) < m.width * 0.44 + item.radius * 0.45 &&
            Math.abs(dy) < m.height * 0.42 + item.radius * 0.4
          ) {
            s.foods.splice(i, 1);

            if (item.type === s.targetFood) {
              s.score += 1;
              s.catchesForTarget += 1;
              m.mood = 'happy';
              m.moodTimer = 0.45;
              m.squashX = 1.24;
              m.squashY = 0.8;

              emitParticles(item.x, item.y, 18);
              s.floatingTexts.push({
                x: m.x,
                y: m.y - 56,
                vy: -56,
                text: '+1',
                color: '#059669',
                life: 0.8,
                maxLife: 0.8,
              });
              soundEngine.playEatGood();

              if (s.catchesForTarget >= TARGET_GOAL) {
                pickNextTarget(true);
                soundEngine.playTargetChange();
              }
              syncHudSnapshot();
            } else {
              s.hearts = Math.max(0, s.hearts - 1);
              m.mood = 'sad';
              m.moodTimer = 0.65;
              m.squashX = 0.84;
              m.squashY = 1.16;
              s.shakeTimer = 0.22;
              s.shakeStrength = 8;

              s.floatingTexts.push({
                x: m.x,
                y: m.y - 56,
                vy: -52,
                text: '-1 ♥',
                color: '#DC2626',
                life: 0.85,
                maxLife: 0.85,
              });
              soundEngine.playEatWrong();

              if (s.hearts <= 0) {
                if (s.score > s.bestScore) {
                  s.bestScore = s.score;
                  setIsNewBest(true);
                  try {
                    localStorage.setItem(STORAGE_KEY, String(s.bestScore));
                  } catch {
                    // Ignore storage quota errors
                  }
                }
                s.state = 'GAME_OVER';
                setGameState('GAME_OVER');
                soundEngine.playGameOver();
              }
              syncHudSnapshot();
            }
            continue;
          }

          if (item.y - item.radius > s.height + 32) {
            s.foods.splice(i, 1);
          }
        }

        // Eye tracking & excited mouth anticipation
        if (nearestTarget) {
          const tx = Math.max(-1, Math.min(1, (nearestTarget.x - m.x) / 180));
          const ty = Math.max(-1, Math.min(1, (nearestTarget.y - m.y) / 180));
          m.lookX += (tx - m.lookX) * Math.min(1, dt * 10);
          m.lookY += (ty - m.lookY) * Math.min(1, dt * 10);
          const targetOpen = nearestDist < 170 ? 1 : 0;
          m.mouthOpenAmount += (targetOpen - m.mouthOpenAmount) * Math.min(1, dt * 12);
        } else {
          m.lookX += (0 - m.lookX) * Math.min(1, dt * 6);
          m.lookY += (0 - m.lookY) * Math.min(1, dt * 6);
          m.mouthOpenAmount += (0 - m.mouthOpenAmount) * Math.min(1, dt * 10);
        }

        // Update pooled particles
        for (const p of s.particles) {
          if (!p.active) continue;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 430 * dt;
          p.rotation += p.spin * dt;
          p.life -= dt;
          p.alpha = Math.max(0, p.life / p.maxLife);
          if (p.life <= 0) p.active = false;
        }

        // Update floating score texts
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += ft.vy * dt;
          ft.life -= dt;
          if (ft.life <= 0) s.floatingTexts.splice(i, 1);
        }
      }

      // Render frame
      ctx.save();
      if (s.shakeTimer > 0) {
        const decay = s.shakeTimer / 0.22;
        const sx = (Math.random() - 0.5) * s.shakeStrength * decay * 2;
        const sy = (Math.random() - 0.5) * s.shakeStrength * decay * 2;
        ctx.translate(sx, sy);
      }

      drawBackdrop(ctx, s.width, s.height, s.clouds, s.elapsed);

      for (const item of s.foods) {
        drawFallingFood(ctx, item, item.type === s.targetFood);
      }

      drawMonsterAndBubble(
        ctx,
        s.monster,
        s.targetFood,
        s.state === 'PLAYING' || s.state === 'PAUSED',
        s.bubblePulse
      );

      drawParticles(ctx, s.particles);
      drawFloatingTexts(ctx, s.floatingTexts);
      ctx.restore();

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [pickNextTarget, syncHudSnapshot]);

  const handlePointerInput = (clientX: number) => {
    const s = simRef.current;
    if (s.state !== 'PLAYING') return;
    s.pointerActive = true;
    s.pointerX = clientX;
  };

  const targetFoodInfo = FOOD_CATALOG.find((f) => f.id === hud.targetFood) ?? FOOD_CATALOG[0];

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-sky-100 select-none">
      {/* Isolated 60fps Canvas Playfield */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => handlePointerInput(e.clientX)}
        onPointerMove={(e) => handlePointerInput(e.clientX)}
        className="block h-full w-full cursor-pointer"
        aria-label="ملعب لعبة أكل الكائنات اللطيفة"
      />

      {/* Top HUD Overlay (pointer-events: none wrapper so playfield stays unobstructed) */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-5">
        {/* Right Side (RTL start): Craving Display + Hearts */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2.5 sm:gap-3">
          {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
            <>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-sky-300 bg-white/95 px-3.5 py-2 shadow-sm">
                <FoodBadgeSvg foodId={hud.targetFood} className="h-9 w-9 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-500">الوحش يطلب</div>
                  <div className="font-display text-base font-extrabold text-slate-900 leading-tight whitespace-nowrap">
                    {targetFoodInfo.labelAr}
                  </div>
                </div>
                <div className="flex items-center gap-1 pr-1" aria-label="تقدم الطلب الحالي">
                  {Array.from({ length: hud.targetGoal }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        idx < hud.catchesForTarget ? 'bg-emerald-500' : 'bg-sky-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-2xl border-2 border-sky-200 bg-white/95 px-3.5 py-2.5 shadow-sm">
                <div className="flex items-center gap-1" aria-label="القلوب المتبقية">
                  {Array.from({ length: hud.maxHearts }).map((_, idx) => {
                    const alive = idx < hud.hearts;
                    return (
                      <svg
                        key={idx}
                        viewBox="0 0 24 24"
                        className={`h-5 w-5 transition-transform duration-150 ${
                          alive ? 'scale-100 opacity-100' : 'scale-75 opacity-25'
                        }`}
                        aria-hidden="true"
                      >
                        <path
                          d="M12 21s-7.2-4.6-9.5-9.1C.7 8.4 2.8 4.5 6.6 4.5c2.1 0 3.9 1.1 5.4 2.9 1.5-1.8 3.3-2.9 5.4-2.9 3.8 0 5.9 3.9 4.1 7.4C19.2 16.4 12 21 12 21z"
                          fill="#EF4444"
                          stroke="#991B1B"
                          strokeWidth="1.6"
                        />
                      </svg>
                    );
                  })}
                </div>
                <span className="text-xs font-extrabold text-slate-700 tabular-nums">
                  {hud.hearts}/{hud.maxHearts}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Left Side (RTL end): Score Cluster + Controls */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
          {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
            <div className="flex items-center gap-3.5 rounded-2xl border-2 border-sky-200 bg-white/95 px-4 py-1.5 shadow-sm">
              <div>
                <div className="text-[11px] font-bold text-slate-500">النقاط</div>
                <div className="font-display text-xl font-extrabold text-emerald-700 tabular-nums leading-tight">
                  {hud.score}
                </div>
              </div>
              <div className="h-7 w-px bg-sky-100" />
              <div>
                <div className="text-[11px] font-bold text-slate-500">الأفضل</div>
                <div className="font-display text-xl font-extrabold text-slate-800 tabular-nums leading-tight">
                  {hud.bestScore}
                </div>
              </div>
              <div className="hidden sm:block h-7 w-px bg-sky-100" />
              <div className="hidden sm:block">
                <div className="text-[11px] font-bold text-slate-500">المستوى</div>
                <div className="font-display text-xl font-extrabold text-amber-600 tabular-nums leading-tight">
                  {hud.level}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
            className="inline-flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-xl border-2 border-sky-200 bg-white/95 px-3 text-sm font-bold text-slate-800 shadow-sm transition-transform hover:bg-white active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {muted ? <VolumeX className="h-4 w-4 text-slate-500" /> : <Volume2 className="h-4 w-4 text-emerald-600" />}
            <span className="hidden md:inline">{muted ? 'صامت' : 'الصوت'}</span>
          </button>

          {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
            <button
              type="button"
              onClick={togglePause}
              aria-label={gameState === 'PAUSED' ? 'متابعة اللعب' : 'إيقاف مؤقت'}
              className="inline-flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-xl border-2 border-sky-200 bg-white/95 px-3 text-sm font-bold text-slate-800 shadow-sm transition-transform hover:bg-white active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {gameState === 'PAUSED' ? (
                <>
                  <Play className="h-4 w-4 text-emerald-600" />
                  <span className="hidden sm:inline">متابعة</span>
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 text-sky-700" />
                  <span className="hidden sm:inline">إيقاف</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* TITLE SCREEN */}
      {gameState === 'TITLE_MENU' && (
        <section className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <div className="animate-pop-in w-full max-w-md rounded-3xl border-2 border-sky-300 bg-white/95 p-7 text-center shadow-xl">
            {/* Custom SVG Mint Monster Emblem */}
            <div className="animate-gentle-float mx-auto mb-3 w-28">
              <svg viewBox="0 0 120 100" className="h-24 w-28" aria-hidden="true">
                <path d="M36 28 Q24 8 42 16 Q48 22 48 26 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
                <path d="M84 28 Q96 8 78 16 Q72 22 72 26 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
                <path
                  d="M60 18 C92 18 100 54 94 74 C88 86 32 86 26 74 C20 54 28 18 60 18 Z"
                  fill="#34D399"
                  stroke="#059669"
                  strokeWidth="3.5"
                />
                <ellipse cx="60" cy="64" rx="22" ry="15" fill="#A7F3D0" />
                <ellipse cx="38" cy="54" rx="7" ry="4.5" fill="#FB923C" opacity="0.75" />
                <ellipse cx="82" cy="54" rx="7" ry="4.5" fill="#FB923C" opacity="0.75" />
                <circle cx="47" cy="43" r="9.5" fill="#FFFFFF" stroke="#064E3B" strokeWidth="2.2" />
                <circle cx="73" cy="43" r="9.5" fill="#FFFFFF" stroke="#064E3B" strokeWidth="2.2" />
                <circle cx="48" cy="43" r="4.8" fill="#0F172A" />
                <circle cx="74" cy="43" r="4.8" fill="#0F172A" />
                <circle cx="46.5" cy="41.5" r="1.8" fill="#FFFFFF" />
                <circle cx="72.5" cy="41.5" r="1.8" fill="#FFFFFF" />
                <path d="M49 58 Q60 68 71 58" fill="none" stroke="#064E3B" strokeWidth="3.2" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="font-display text-3xl font-extrabold text-emerald-800 sm:text-4xl">
              أكل الكائنات اللطيفة
            </h1>
            <p className="mt-1 text-xs font-bold tracking-wide text-sky-700">
              Feed the Cute Monster
            </p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
              حرّك الوحش النعناعي ليلتقط الطعام الذي يظهر في بالون التفكير فوق رأسه، وانتبه من الأطعمة الخاطئة حتى تحافظ على القلوب الثلاثة!
            </p>

            {/* Quick visual food preview strip */}
            <div className="my-4 flex items-center justify-center gap-3 rounded-2xl bg-sky-50/80 py-2.5 px-4">
              {FOOD_CATALOG.map((item) => (
                <FoodBadgeSvg key={item.id} foodId={item.id} className="h-7 w-7" />
              ))}
            </div>

            <button
              type="button"
              onClick={startNewRound}
              className="w-full min-h-[52px] rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 px-6 py-3 font-display text-xl font-extrabold text-white transition-transform hover:bg-emerald-700 active:translate-y-0.5 cursor-pointer"
            >
              ابدأ اللعب
            </button>

            <p className="mt-4 text-xs font-semibold text-slate-500">
              الماوس أو اللمس أو الأسهم للتحريك · Space للإيقاف المؤقت
            </p>
          </div>
        </section>
      )}

      {/* PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <section className="absolute inset-0 z-20 flex items-center justify-center bg-sky-900/20 p-4">
          <div className="animate-pop-in w-full max-w-sm rounded-3xl border-2 border-sky-300 bg-white p-7 text-center shadow-xl">
            <h2 className="font-display text-3xl font-extrabold text-emerald-800">استراحة قصيرة</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              الوحش اللطيف ينتظرك لتكمل إطعامه!
            </p>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={togglePause}
                className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 px-5 font-display text-lg font-extrabold text-white transition-colors hover:bg-emerald-700 cursor-pointer"
              >
                <Play className="h-5 w-5" />
                <span>متابعة اللعب</span>
              </button>

              <button
                type="button"
                onClick={startNewRound}
                className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl border-2 border-sky-200 bg-sky-50 px-5 text-sm font-bold text-sky-900 transition-colors hover:bg-sky-100 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>إعادة من البداية</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && (
        <section className="absolute inset-0 z-20 flex items-center justify-center bg-sky-900/20 p-4">
          <div className="animate-pop-in w-full max-w-md rounded-3xl border-2 border-sky-300 bg-white p-7 text-center shadow-xl">
            <h2 className="font-display text-3xl font-extrabold text-emerald-800">انتهت الجولة!</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {isNewBest
                ? 'رائع! لقد حققت رقماً قياسياً جديداً!'
                : 'أحسنت يا بطل! حاول مجدداً لإطعام الوحش المزيد من الأطعمة اللذيذة.'}
            </p>

            <div className="my-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3.5">
                <div className="text-xs font-bold text-slate-500">نقاطك</div>
                <div className="mt-1 font-display text-3xl font-extrabold text-emerald-700 tabular-nums">
                  {hud.score}
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
                <div className="text-xs font-bold text-slate-500">أعلى نتيجة</div>
                <div className="mt-1 font-display text-3xl font-extrabold text-amber-700 tabular-nums">
                  {hud.bestScore}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={startNewRound}
              className="inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 px-6 font-display text-xl font-extrabold text-white transition-colors hover:bg-emerald-700 cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
