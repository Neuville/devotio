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
import { Session } from '../types';

export function useSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, 'users', user.uid, 'sessions');
    const q   = query(ref, orderBy('time', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setSessions(snap.docs.map((d) => d.data() as Session));
        setLoading(false);
      },
      (error) => {
        console.error('[useSessions] Firestore error:', error.code, error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  async function addSession(session: Omit<Session, 'id' | 'createdAt' | 'notificationId'>) {
    if (!user) return;
    const id  = `session_${Date.now()}`;
    const ref = doc(db, 'users', user.uid, 'sessions', id);
    await setDoc(ref, { ...session, id, notificationId: '', createdAt: Date.now() });
  }

  async function updateSession(id: string, updates: Partial<Session>) {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'sessions', id);
    await setDoc(ref, updates, { merge: true });
  }

  async function deleteSession(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'sessions', id));
  }

  async function toggleSession(id: string, isActive: boolean) {
    await updateSession(id, { isActive });
  }

  return { sessions, loading, addSession, updateSession, deleteSession, toggleSession };
}
