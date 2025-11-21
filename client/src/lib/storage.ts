import { GameStats, Achievement, ACHIEVEMENTS, DEFAULT_BALANCE } from '@/types/slotGame';

const STORAGE_KEYS = {
  BALANCE: 'candy_mines_balance',
  STATS: 'candy_mines_stats',
  ACHIEVEMENTS: 'candy_mines_achievements',
};

export function saveBalance(balance: number): void {
  localStorage.setItem(STORAGE_KEYS.BALANCE, balance.toString());
}

export function loadBalance(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.BALANCE);
  return stored ? parseInt(stored, 10) : DEFAULT_BALANCE;
}

export function saveStats(stats: GameStats): void {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

export function loadStats(): GameStats {
  const stored = localStorage.getItem(STORAGE_KEYS.STATS);
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    highestWin: 0,
    highestMultiplier: 0,
    gamesPlayed: 0,
    winRate: 0,
    lastLogin: Date.now(),
    dailyBonusClaimed: false,
    currentStreak: 0,
    longestStreak: 0,
  };
}

export function saveAchievements(achievements: Achievement[]): void {
  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
}

export function loadAchievements(): Achievement[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  if (stored) {
    return JSON.parse(stored);
  }
  
  return ACHIEVEMENTS.map(a => ({ ...a }));
}

export function checkDailyBonus(): { canClaim: boolean; amount: number } {
  const stats = loadStats();
  const now = Date.now();
  const lastLogin = stats.lastLogin || 0;
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  // Farklı gün mü kontrol et
  const lastLoginDate = new Date(lastLogin).setHours(0, 0, 0, 0);
  const nowDate = new Date(now).setHours(0, 0, 0, 0);
  
  const canClaim = nowDate > lastLoginDate && !stats.dailyBonusClaimed;
  
  return { canClaim, amount: 100 };
}

export function claimDailyBonus(): number {
  const stats = loadStats();
  stats.dailyBonusClaimed = true;
  stats.lastLogin = Date.now();
  saveStats(stats);
  
  const currentBalance = loadBalance();
  const newBalance = currentBalance + 100;
  saveBalance(newBalance);
  
  return newBalance;
}

export function resetDailyBonus(): void {
  const stats = loadStats();
  const now = Date.now();
  const lastLogin = stats.lastLogin || 0;
  
  const lastLoginDate = new Date(lastLogin).setHours(0, 0, 0, 0);
  const nowDate = new Date(now).setHours(0, 0, 0, 0);
  
  if (nowDate > lastLoginDate) {
    stats.dailyBonusClaimed = false;
    stats.lastLogin = now;
    saveStats(stats);
  }
}
