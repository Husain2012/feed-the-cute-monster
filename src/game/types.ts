/**
 * Game state machine modes and entity definitions for Feed the Cute Monster.
 */

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type FoodId = 'apple' | 'banana' | 'star' | 'orange' | 'pear' | 'cookie';

export interface FoodDefinition {
  id: FoodId;
  labelAr: string;
  accentColor: string;
}

export const FOOD_CATALOG: FoodDefinition[] = [
  { id: 'apple', labelAr: 'تفاحة', accentColor: '#EF4444' },
  { id: 'banana', labelAr: 'موزة', accentColor: '#FACC15' },
  { id: 'star', labelAr: 'نجمة ذهبية', accentColor: '#F59E0B' },
  { id: 'orange', labelAr: 'برتقالة', accentColor: '#F97316' },
  { id: 'pear', labelAr: 'كمثرى', accentColor: '#84CC16' },
  { id: 'cookie', labelAr: 'بسكويت', accentColor: '#D97706' },
];

export type MonsterMood = 'idle' | 'happy' | 'sad' | 'excited';

export interface FallingFood {
  id: number;
  type: FoodId;
  x: number;
  y: number;
  vy: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  swayPhase: number;
  swayAmp: number;
}

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  spin: number;
  shape: 'star' | 'circle' | 'spark';
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface CloudItem {
  x: number;
  y: number;
  scale: number;
  speed: number;
}

export interface HudSnapshot {
  score: number;
  bestScore: number;
  hearts: number;
  maxHearts: number;
  level: number;
  targetFood: FoodId;
  catchesForTarget: number;
  targetGoal: number;
}
