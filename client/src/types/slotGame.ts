export type CellState = 'hidden' | 'revealed' | 'mine' | 'disabled';

export type SymbolType = 'crown' | 'diamond' | 'chest' | 'shield' | 'x2' | 'x3' | 'x5' | 'x10' | 'x50';

export interface SlotCell {
  id: string;
  row: number;
  col: number;
  symbolType: SymbolType;
  state: CellState;
  baseWin: number;
  multiplier: number;
  isMine: boolean;
}

export type GamePhase = 'betting' | 'playing' | 'busted' | 'cashedout';

export interface GameState {
  phase: GamePhase;
  balance: number;
  currentBet: number;
  grid: SlotCell[][];
  revealedCount: number;
  totalMultiplier: number;
  baseWinTotal: number;
  currentWin: number;
  mineCount: number;
  gridSize: number;
}

export interface GameHistory {
  bet: number;
  win: number;
  multiplier: number;
  result: 'win' | 'bust';
  timestamp: number;
}

export interface GameStats {
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  highestWin: number;
  highestMultiplier: number;
  gamesPlayed: number;
  winRate: number;
  lastLogin: number;
  dailyBonusClaimed: boolean;
  currentStreak: number; // Ardışık kazanç sayısı
  longestStreak: number; // En uzun streak
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number; // 0-100
  target?: number;
}

export interface GiftItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number; // Coin cinsinden
  category: 'electronics' | 'gaming' | 'fashion' | 'home' | 'other';
  stock: number;
  featured: boolean;
}

export interface UserInventory {
  userId: string;
  items: {
    giftId: string;
    purchasedAt: number;
    claimed: boolean;
  }[];
}

export const BET_AMOUNTS = [10, 25, 50, 100, 250, 500];

// Dengeli sembol sistemi
export const SYMBOL_CONFIG: Record<SymbolType, { baseWin: number; multiplier: number; image: string; rarity: number }> = {
  shield: { baseWin: 50, multiplier: 0, image: '/images/KALKAN.png', rarity: 35 },
  crown: { baseWin: 80, multiplier: 0, image: '/images/TAÇ.png', rarity: 30 },
  diamond: { baseWin: 100, multiplier: 0, image: '/images/ELMAS.png', rarity: 20 },
  chest: { baseWin: 200, multiplier: 0, image: '/images/SANDIK.png', rarity: 10 },
  x2: { baseWin: 0, multiplier: 2, image: '/images/2X.png', rarity: 8 },
  x3: { baseWin: 0, multiplier: 3, image: '/images/3X.png', rarity: 5 },
  x5: { baseWin: 0, multiplier: 5, image: '/images/5X.png', rarity: 3 },
  x10: { baseWin: 0, multiplier: 10, image: '/images/10X.png', rarity: 1.5 },
  x50: { baseWin: 0, multiplier: 50, image: '/images/50X.png', rarity: 0.5 },
};

export const MINE_IMAGE = '/images/BOMBA.png';
export const COIN_IMAGE = '/images/COIN.png';
export const BACKGROUND_IMAGE = '/images/arkaplan.png';

export const GRID_SIZES = [
  { size: 5, mines: 3, name: 'Kolay' },
  { size: 5, mines: 5, name: 'Orta' },
  { size: 6, mines: 7, name: 'Zor' },
];

export const DEFAULT_BALANCE = 1000;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_10x',
    title: 'İlk 10X',
    description: '10X çarpan sembolünü ilk kez aç',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'win_streak_5',
    title: '5 Ardışık Kazanç',
    description: 'Üst üste 5 oyun kazan',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    target: 5,
  },
  {
    id: 'big_win_1000',
    title: 'Büyük Kazanç',
    description: 'Tek seferde 1000 coin kazan',
    icon: '💰',
    unlocked: false,
  },
  {
    id: 'play_10_games',
    title: 'Deneyimli Oyuncu',
    description: '10 oyun oyna',
    icon: '🎮',
    unlocked: false,
    progress: 0,
    target: 10,
  },
  {
    id: 'first_50x',
    title: 'Jackpot!',
    description: '50X çarpan sembolünü aç',
    icon: '🎰',
    unlocked: false,
  },
  {
    id: 'streak_10',
    title: 'Streak Master',
    description: '10 ardışık kazanç elde et',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    target: 10,
  },
];

// Hediye kategorileri
export const GIFT_CATEGORIES = [
  { id: 'all', name: 'Tümü', icon: '🎁' },
  { id: 'electronics', name: 'Elektronik', icon: '📱' },
  { id: 'gaming', name: 'Oyun', icon: '🎮' },
  { id: 'fashion', name: 'Moda', icon: '👕' },
  { id: 'home', name: 'Ev', icon: '🏠' },
  { id: 'other', name: 'Diğer', icon: '🎨' },
];

// Örnek hediyeler (Firebase'den gelecek)
export const SAMPLE_GIFTS: GiftItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: '256GB, Titanium Black',
    image: '/images/gifts/iphone.png',
    price: 50000,
    category: 'electronics',
    stock: 5,
    featured: true,
  },
  {
    id: '2',
    name: 'PlayStation 5',
    description: 'Digital Edition + 2 Controller',
    image: '/images/gifts/playstation.png',
    price: 25000,
    category: 'gaming',
    stock: 10,
    featured: true,
  },
  {
    id: '3',
    name: 'AirPods Pro',
    description: '2. Nesil, USB-C',
    image: '/images/gifts/airpods.png',
    price: 10000,
    category: 'electronics',
    stock: 20,
    featured: false,
  },
  {
    id: '4',
    name: 'Apple Watch Ultra',
    description: 'GPS + Cellular, Titanium',
    image: '/images/gifts/smartwatch.png',
    price: 35000,
    category: 'electronics',
    stock: 8,
    featured: true,
  },
  {
    id: '5',
    name: 'MacBook Air M3',
    description: '15", 16GB RAM, 512GB SSD',
    image: '/images/gifts/laptop.png',
    price: 60000,
    category: 'electronics',
    stock: 3,
    featured: true,
  },
];
