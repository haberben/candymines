import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Unique referral code oluştur
export function generateReferralCode(username: string, uid: string): string {
  const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const uidPart = uid.substring(0, 6).toUpperCase();
  return `${cleanUsername}-${uidPart}`;
}

// Referral code ile kullanıcı bul
export async function getUserByReferralCode(code: string): Promise<string | null> {
  try {
    // Tüm kullanıcıları taramak yerine referralCodes collection kullan
    const referralDoc = await getDoc(doc(db, 'referralCodes', code));
    if (referralDoc.exists()) {
      return referralDoc.data().userId;
    }
    return null;
  } catch (error) {
    console.error('Error finding user by referral code:', error);
    return null;
  }
}

// Referral code'u kaydet
export async function saveReferralCode(code: string, userId: string) {
  try {
    await setDoc(doc(db, 'referralCodes', code), {
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving referral code:', error);
  }
}

// Referral bonus ver (davet eden + davet edilen)
export async function processReferral(referrerId: string, newUserId: string) {
  try {
    // Davet edene 500 coin (artırıldı)
    const referrerRef = doc(db, 'users', referrerId);
    await updateDoc(referrerRef, {
      balance: increment(500),
      'referralStats.totalReferrals': increment(1),
      'referralStats.totalEarned': increment(500),
    });

    // Davet edilene 200 coin (artırıldı)
    const newUserRef = doc(db, 'users', newUserId);
    await updateDoc(newUserRef, {
      balance: increment(200),
      referredBy: referrerId,
    });

    return true;
  } catch (error) {
    console.error('Error processing referral:', error);
    return false;
  }
}

// Referral istatistikleri al
export async function getReferralStats(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        totalReferrals: data.referralStats?.totalReferrals || 0,
        totalEarned: data.referralStats?.totalEarned || 0,
      };
    }
    return { totalReferrals: 0, totalEarned: 0 };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return { totalReferrals: 0, totalEarned: 0 };
  }
}
