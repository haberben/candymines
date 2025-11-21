import { IconType } from './icons';

export type CandyType = IconType;

export interface Cell {
  type: CandyType | null;
  row: number;
  col: number;
  id: string;
  isMatched?: boolean;
  isSelected?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Match {
  cells: Position[];
  type: CandyType;
  length: number;
}

export type GameState = 
  | 'menu'
  | 'playing'
  | 'selecting'
  | 'swapping'
  | 'matching'
  | 'falling'
  | 'paused'
  | 'victory'
  | 'gameover';

export interface GameStats {
  score: number;
  moves: number;
  level: number;
  targetScore: number;
  maxMoves: number;
  combo: number;
}

export interface LevelConfig {
  level: number;
  targetScore: number;
  maxMoves: number;
  gridSize: number;
  candyTypes: number;
}

export const CANDY_TYPES: CandyType[] = [
  'play',
  'shop', 
  'wallet',
  'quests',
  'profile',
  'settings',
];

export const LEVELS: LevelConfig[] = [
  { level: 1, targetScore: 1000, maxMoves: 30, gridSize: 8, candyTypes: 4 },
  { level: 2, targetScore: 2000, maxMoves: 28, gridSize: 8, candyTypes: 5 },
  { level: 3, targetScore: 3500, maxMoves: 26, gridSize: 8, candyTypes: 5 },
  { level: 4, targetScore: 5000, maxMoves: 25, gridSize: 8, candyTypes: 6 },
  { level: 5, targetScore: 7000, maxMoves: 24, gridSize: 8, candyTypes: 6 },
  { level: 6, targetScore: 10000, maxMoves: 22, gridSize: 8, candyTypes: 6 },
  { level: 7, targetScore: 15000, maxMoves: 20, gridSize: 8, candyTypes: 6 },
  { level: 8, targetScore: 20000, maxMoves: 20, gridSize: 8, candyTypes: 6 },
  { level: 9, targetScore: 30000, maxMoves: 18, gridSize: 8, candyTypes: 6 },
  { level: 10, targetScore: 50000, maxMoves: 15, gridSize: 8, candyTypes: 6 },
];

export const SCORE_VALUES = {
  MATCH_3: 100,
  MATCH_4: 200,
  MATCH_5: 500,
  COMBO_MULTIPLIER: 1.5,
};
