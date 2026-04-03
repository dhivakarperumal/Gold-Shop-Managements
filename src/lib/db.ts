import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { dbFirestore } from './firebase';

export const db = {
  async get(collectionName: string) {
    const querySnapshot = await getDocs(collection(dbFirestore, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async add(collectionName: string, item: any) {
    const docRef = await addDoc(collection(dbFirestore, collectionName), {
      ...item,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...item };
  },
  
  async update(collectionName: string, id: string, updates: any) {
    const docRef = doc(dbFirestore, collectionName, id);
    await updateDoc(docRef, updates);
    return { id, ...updates };
  },
  
  async delete(collectionName: string, id: string) {
    const docRef = doc(dbFirestore, collectionName, id);
    await deleteDoc(docRef);
  }
};
