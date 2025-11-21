import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface LoginStreakData {
  currentStreak: number;
  lastLoginDate: string; // YYYY-MM-DD format
  longestStreak: number;
  totalLogins: number;
}

const STREAK_BONUSES = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

export function getStreakBonus(streakDay: number): number {
  // Streak 10 günü geçerse 10000 sabit kalır
  if (streakDay > STREAK_BONUSES.length) {
    return STREAK_BONUSES[STREAK_BONUSES.length - 1];
  }
  return STREAK_BONUSES[streakDay - 1];
}

export function getTodayDateString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function isConsecutiveDay(lastDate: string, todayDate: string): boolean {
  const last = new Date(lastDate);
  const today = new Date(todayDate);
  
  const diffTime = today.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
}

export async function checkAndUpdateLoginStreak(uid: string): Promise<{
  isNewDay: boolean;
  streakBonus: number;
  currentStreak: number;
  streakReset: boolean;
}> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const userData = userSnap.data();
    const todayDate = getTodayDateString();
    
    const loginStreak: LoginStreakData = userData.loginStreak || {
      currentStreak: 0,
      lastLoginDate: '',
      longestStreak: 0,
      totalLogins: 0,
    };

    // Bugün zaten giriş yapmış mı?
    if (loginStreak.lastLoginDate === todayDate) {
      return {
        isNewDay: false,
        streakBonus: 0,
        currentStreak: loginStreak.currentStreak,
        streakReset: false,
      };
    }

    let newStreak = 1;
    let streakReset = false;

    // Dün giriş yapmış mı?
    if (loginStreak.lastLoginDate && isConsecutiveDay(loginStreak.lastLoginDate, todayDate)) {
      newStreak = loginStreak.currentStreak + 1;
    } else if (loginStreak.lastLoginDate) {
      // Streak kırıldı
      streakReset = true;
    }

    const streakBonus = getStreakBonus(newStreak);
    const newBalance = (userData.balance || 0) + streakBonus;
    const newLongestStreak = Math.max(newStreak, loginStreak.longestStreak);

    // Firestore'u güncelle
    await updateDoc(userRef, {
      balance: newBalance,
      'loginStreak.currentStreak': newStreak,
      'loginStreak.lastLoginDate': todayDate,
      'loginStreak.longestStreak': newLongestStreak,
      'loginStreak.totalLogins': (loginStreak.totalLogins || 0) + 1,
      lastLogin: serverTimestamp(),
    });

    return {
      isNewDay: true,
      streakBonus,
      currentStreak: newStreak,
      streakReset,
    };
  } catch (error) {
    console.error('Error checking login streak:', error);
    throw error;
  }
}
