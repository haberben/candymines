import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { GameStats } from '@/types/slotGame';

export async function updateUserBalance(uid: string, amount: number) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      balance: increment(amount), // increment kullan - eksi değere düşmemesi için
      lastLogin: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    throw error;
  }
}

export async function updateUserStats(uid: string, stats: Partial<GameStats>) {
  try {
    const userRef = doc(db, 'users', uid);
    const updates: any = {
      lastLogin: serverTimestamp(),
    };

    if (stats.gamesPlayed !== undefined) {
      updates['stats.gamesPlayed'] = increment(stats.gamesPlayed);
    }
    if (stats.totalWins !== undefined) {
      updates['stats.totalWins'] = increment(stats.totalWins);
    }
    if (stats.totalLosses !== undefined) {
      updates['stats.totalLosses'] = increment(stats.totalLosses);
    }
    if (stats.highestWin !== undefined) {
      updates['stats.highestWin'] = stats.highestWin;
    }
    if (stats.highestMultiplier !== undefined) {
      updates['stats.highestMultiplier'] = stats.highestMultiplier;
    }

    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating stats:', error);
    throw error;
  }
}

export async function placeBet(uid: string, betAmount: number) {
  try {
    // Bahis miktarını eksi olarak gönder (bakiyeden düş)
    await updateUserBalance(uid, -betAmount);
    await updateUserStats(uid, { gamesPlayed: 1 });
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
}

export async function cashout(uid: string, winAmount: number, currentMultiplier: number) {
  try {
    await updateUserBalance(uid, winAmount);
    await updateUserStats(uid, { 
      totalWins: 1,
    });
    
    // En yüksek kazanç/çarpan kontrolü için mevcut değerleri al
    // Bu kısım AuthContext'te userData'dan yapılacak
  } catch (error) {
    console.error('Error cashing out:', error);
    throw error;
  }
}

export async function gameLost(uid: string) {
  try {
    await updateUserStats(uid, { 
      totalLosses: 1,
    });
  } catch (error) {
    console.error('Error recording loss:', error);
    throw error;
  }
}
