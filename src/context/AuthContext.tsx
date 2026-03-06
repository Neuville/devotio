import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, db } from '../services/firebase';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signUp(email: string, password: string, username: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: username });
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid:            credential.user.uid,
      username,
      email,
      profilePicture: null,
      createdAt:      serverTimestamp(),
    });
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const googleCredential = GoogleAuthProvider.credential(userInfo.data?.idToken ?? '');
    const result = await signInWithCredential(auth, googleCredential);

    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid:            result.user.uid,
        username:       result.user.displayName ?? 'Devoto',
        email:          result.user.email,
        profilePicture: result.user.photoURL ?? null,
        createdAt:      serverTimestamp(),
      });
    }
  }

  async function logOut() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
