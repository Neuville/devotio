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
import {
  cancelNotifications,
  scheduleSessionNotifications,
} from '../services/notifications';

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

  // addSession accepts the full session except createdAt — caller provides the ID
  // and notificationIds (already scheduled before calling this)
  async function addSession(session: Omit<Session, 'createdAt'>): Promise<void> {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'sessions', session.id);
    await setDoc(ref, { ...session, createdAt: Date.now() });
  }

  async function updateSession(id: string, updates: Partial<Session>): Promise<void> {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'sessions', id);
    await setDoc(ref, updates, { merge: true });
  }

  async function deleteSession(id: string): Promise<void> {
    if (!user) return;
    const session = sessions.find((s) => s.id === id);
    if (session?.notificationIds?.length) {
      await cancelNotifications(session.notificationIds);
    }
    await deleteDoc(doc(db, 'users', user.uid, 'sessions', id));
  }

  async function toggleSession(id: string, isActive: boolean): Promise<void> {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;

    if (!isActive) {
      if (session.notificationIds?.length) {
        await cancelNotifications(session.notificationIds);
      }
      await updateSession(id, { isActive: false, notificationIds: [] });
    } else {
      // Reschedule — no prayer titles available here, session name used as body
      const newIds = await scheduleSessionNotifications(session);
      await updateSession(id, { isActive: true, notificationIds: newIds });
    }
  }

  return { sessions, loading, addSession, updateSession, deleteSession, toggleSession };
}
