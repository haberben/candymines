import { Achievement, GameStats, SlotCell } from '@/types/slotGame';
import { loadAchievements, saveAchievements, loadStats, saveStats } from './storage';

export function checkAchievements(
  grid: SlotCell[][],
  win: number,
  multiplier: number,
  stats: GameStats
): Achievement[] {
  const achievements = loadAchievements();
  const newlyUnlocked: Achievement[] = [];
  
  achievements.forEach(achievement => {
    if (achievement.unlocked) return;
    
    let shouldUnlock = false;
    
    switch (achievement.id) {
      case 'first_10x':
        // 10X sembolü açıldı mı?
        grid.forEach(row => {
          row.forEach(cell => {
            if (cell.state === 'revealed' && cell.symbolType === 'x10') {
              shouldUnlock = true;
            }
          });
        });
        break;
        
      case 'win_streak_5':
        if (stats.currentStreak >= 5) {
          shouldUnlock = true;
        }
        break;
        
      case 'streak_10':
        if (stats.currentStreak >= 10) {
          shouldUnlock = true;
        }
        break;
        
      case 'big_win_1000':
        if (win >= 1000) {
          shouldUnlock = true;
        }
        break;
        
      case 'play_10_games':
        if (stats.gamesPlayed >= 10) {
          shouldUnlock = true;
        }
        break;
        
      case 'first_50x':
        grid.forEach(row => {
          row.forEach(cell => {
            if (cell.state === 'revealed' && cell.symbolType === 'x50') {
              shouldUnlock = true;
            }
          });
        });
        break;
    }
    
    if (shouldUnlock) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
      newlyUnlocked.push(achievement);
    }
  });
  
  if (newlyUnlocked.length > 0) {
    saveAchievements(achievements);
  }
  
  return newlyUnlocked;
}

export function updateStats(
  bet: number,
  win: number,
  multiplier: number,
  result: 'win' | 'bust',
  previousResult?: 'win' | 'bust'
): GameStats {
  const stats = loadStats();
  
  stats.gamesPlayed++;
  stats.totalBets += bet;
  
  if (result === 'win') {
    stats.totalWins += win;
    stats.highestWin = Math.max(stats.highestWin, win);
    stats.highestMultiplier = Math.max(stats.highestMultiplier, multiplier);
  }
  
  stats.winRate = stats.gamesPlayed > 0 
    ? (stats.totalWins / stats.totalBets) * 100 
    : 0;
  
  // Streak güncelle
  if (result === 'win') {
    stats.currentStreak++;
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }
  
  saveStats(stats);
  return stats;
}
