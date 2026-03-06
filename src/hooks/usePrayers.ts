import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Prayer } from '../types';

export function usePrayers() {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, 'users', user.uid, 'prayers');
    const q   = query(ref, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setPrayers(snap.docs.map((d) => d.data() as Prayer));
        setLoading(false);
      },
      (error) => {
        console.error('[usePrayers] Firestore error:', error.code, error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  async function addPrayer(prayer: Omit<Prayer, 'id' | 'createdAt'>) {
    if (!user) return;
    const id  = `custom_${Date.now()}`;
    const ref = doc(db, 'users', user.uid, 'prayers', id);
    await setDoc(ref, { ...prayer, id, createdAt: Date.now() });
  }

  async function addPreloadedPrayer(prayer: Prayer) {
    if (!user) return;
    // Check not already added
    const alreadyAdded = prayers.some((p) => p.id === prayer.id);
    if (alreadyAdded) return;
    const ref = doc(db, 'users', user.uid, 'prayers', prayer.id);
    await setDoc(ref, { ...prayer, createdAt: Date.now() });
  }

  async function updatePrayer(id: string, updates: Partial<Omit<Prayer, 'id' | 'createdAt'>>) {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'prayers', id);
    await setDoc(ref, updates, { merge: true });
  }

  async function deletePrayer(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'prayers', id));
  }

  return { prayers, loading, addPrayer, addPreloadedPrayer, updatePrayer, deletePrayer };
}
