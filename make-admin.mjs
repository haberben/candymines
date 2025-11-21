import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDH4H_yATjFmAzioRiAATi_qpFtteUEvn4",
  authDomain: "candy-mines.firebaseapp.com",
  projectId: "candy-mines",
  storageBucket: "candy-mines.firebasestorage.app",
  messagingSenderId: "453334899910",
  appId: "1:453334899910:web:03803e21338245b3f00bc7",
  measurementId: "G-FYTJWNKCMC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function makeAdmin(email) {
  try {
    // Email ile kullanıcıyı bul
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`❌ Kullanıcı bulunamadı: ${email}`);
      return;
    }
    
    // İlk eşleşen kullanıcıyı admin yap
    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'users', userDoc.id);
    
    await updateDoc(userRef, {
      role: 'admin'
    });
    
    console.log(`✅ Kullanıcı admin yapıldı: ${email}`);
    console.log(`   User ID: ${userDoc.id}`);
    console.log(`   Username: ${userDoc.data().username}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

// Kullanıcıyı admin yap
makeAdmin('ibrahmyldrim@yandex.com');
