import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCYlXchxMBsj3LtUakGEVYjKohIAgg5lTs",
  authDomain: "gold-shop-management-3c9d4.firebaseapp.com",
  projectId: "gold-shop-management-3c9d4",
  storageBucket: "gold-shop-management-3c9d4.firebasestorage.app",
  messagingSenderId: "1089458962169",
  appId: "1:1089458962169:web:d6c1389232029a75712c28"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const dbFirestore = getFirestore(app);
