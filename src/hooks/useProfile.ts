import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { UserProfile } from '../types';
import type { User } from 'firebase/auth';

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, 'users', user.uid);
    
    // Check if profile exists, if not, create it
    const ensureProfileExists = async () => {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          partnerUid: null
        });
      }
    };

    ensureProfileExists().then(() => {
      // Listen to real-time changes
      const unsubscribe = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, [user]);

  const connectPartner = async (partnerCode: string) => {
    if (!user || !partnerCode || partnerCode === user.uid) return false;
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { partnerUid: partnerCode }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error connecting partner:", error);
      return false;
    }
  };

  const disconnectPartner = async () => {
    if (!user) return false;
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { partnerUid: null }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error disconnecting partner:", error);
      return false;
    }
  };

  return { profile, loading, connectPartner, disconnectPartner };
};
