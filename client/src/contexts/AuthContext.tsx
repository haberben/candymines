import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface UserData {
  uid: string;
  email: string;
  username: string;
  balance: number;
  role: 'user' | 'admin';
  stats: {
    gamesPlayed: number;
    totalWins: number;
    totalLosses: number;
    highestWin: number;
    highestMultiplier: number;
  };
  createdAt: any;
  lastLogin: any;
  isBanned: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  // Referral
  referralCode?: string;
  referredBy?: string;
  referralStats?: {
    totalReferrals: number;
    totalEarned: number;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı verilerini Firestore'dan yükle
  const loadUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        
        // Ban kontrolü
        if (data.isBanned) {
          toast.error('Hesabınız yasaklandı!');
          await firebaseSignOut(auth);
          return null;
        }
        
        setUserData(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  };

  // Yeni kullanıcı verisi oluştur
  const createUserData = async (uid: string, email: string, username: string) => {
    const newUserData: UserData = {
      uid,
      email,
      username,
      balance: 1000, // Başlangıç bakiyesi
      role: 'user',
      stats: {
        gamesPlayed: 0,
        totalWins: 0,
        totalLosses: 0,
        highestWin: 0,
        highestMultiplier: 0,
      },
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isBanned: false,
    };

    await setDoc(doc(db, 'users', uid), newUserData);
    setUserData(newUserData);
    return newUserData;
  };

  // Kayıt ol
  const signUp = async (email: string, password: string, username: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserData(result.user.uid, email, username);
      toast.success('Kayıt başarılı! Hoş geldiniz! 🎉');
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Bu email zaten kullanımda!');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Şifre en az 6 karakter olmalı!');
      } else {
        toast.error('Kayıt başarısız!');
      }
      throw error;
    }
  };

  // Giriş yap
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const data = await loadUserData(result.user.uid);
      
      if (data) {
        // Son giriş zamanını güncelle
        await setDoc(doc(db, 'users', result.user.uid), {
          lastLogin: serverTimestamp(),
        }, { merge: true });
        
        toast.success('Giriş başarılı! 🎮');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Email veya şifre hatalı!');
      } else {
        toast.error('Giriş başarısız!');
      }
      throw error;
    }
  };

  // Google ile giriş
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const existingData = await loadUserData(result.user.uid);
      
      if (!existingData) {
        // Yeni kullanıcı - veri oluştur
        await createUserData(
          result.user.uid,
          result.user.email || '',
          result.user.displayName || 'Oyuncu'
        );
      } else {
        // Mevcut kullanıcı - son giriş güncelle
        await setDoc(doc(db, 'users', result.user.uid), {
          lastLogin: serverTimestamp(),
        }, { merge: true });
      }
      
      toast.success('Google ile giriş başarılı! 🎮');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error('Google girişi başarısız!');
      throw error;
    }
  };

  // Çıkış yap
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserData(null);
      toast.success('Çıkış yapıldı!');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Çıkış başarısız!');
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Real-time bakiye listener
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserData;
        setUserData(data);
      }
    });

    return unsubscribe;
  }, [user]);

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
