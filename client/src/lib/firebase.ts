import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDH4H_yATjFmAzioRiAATi_qpFtteUEvn4",
  authDomain: "candy-mines.firebaseapp.com",
  projectId: "candy-mines",
  storageBucket: "candy-mines.firebasestorage.app",
  messagingSenderId: "453334899910",
  appId: "1:453334899910:web:03803e21338245b3f00bc7",
  measurementId: "G-FYTJWNKCMC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics (optional - only in production)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
    // Analytics hatası uygulamanın çalışmasını engellemez
  }
}

export { analytics };
export default app;
