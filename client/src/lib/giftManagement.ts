import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  isAvailable: boolean;
  createdAt: number;
}

export async function addGift(gift: Omit<Gift, 'id' | 'createdAt'>): Promise<void> {
  try {
    await addDoc(collection(db, 'gifts'), {
      ...gift,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error('Error adding gift:', error);
    throw error;
  }
}

export async function updateGift(giftId: string, updates: Partial<Gift>): Promise<void> {
  try {
    const giftRef = doc(db, 'gifts', giftId);
    await updateDoc(giftRef, updates);
  } catch (error) {
    console.error('Error updating gift:', error);
    throw error;
  }
}

export async function deleteGift(giftId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'gifts', giftId));
  } catch (error) {
    console.error('Error deleting gift:', error);
    throw error;
  }
}

export async function getAllGifts(): Promise<Gift[]> {
  try {
    const giftsSnapshot = await getDocs(collection(db, 'gifts'));
    return giftsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Gift[];
  } catch (error) {
    console.error('Error getting gifts:', error);
    throw error;
  }
}

export async function purchaseGift(userId: string, giftId: string, giftPrice: number): Promise<void> {
  try {
    const { updateUserBalance } = await import('./firestoreSync');
    
    // Bakiyeden düş
    await updateUserBalance(userId, -giftPrice);
    
    // Stok azalt
    const giftRef = doc(db, 'gifts', giftId);
    await updateDoc(giftRef, {
      stock: increment(-1),
    });
    
    // Satın alma kaydı oluştur
    await addDoc(collection(db, 'purchases'), {
      userId,
      giftId,
      price: giftPrice,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error purchasing gift:', error);
    throw error;
  }
}

function increment(value: number) {
  return { increment: value };
}
