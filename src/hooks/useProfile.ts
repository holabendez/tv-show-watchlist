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

  const toggleNotInterested = async (itemId: string) => {
    if (!user || !profile) return;
    const currentNotInterested = profile.notInterested || [];
    const newNotInterested = currentNotInterested.includes(itemId)
      ? currentNotInterested.filter(id => id !== itemId)
      : [...currentNotInterested, itemId];
    
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { notInterested: newNotInterested }, { merge: true });
    } catch (error) {
      console.error("Error toggling not interested:", error);
    }
  };

  const removeNotInterested = async (itemId: string) => {
    if (!user || !profile || !profile.notInterested?.includes(itemId)) return;
    
    try {
      const docRef = doc(db, 'users', user.uid);
      const newNotInterested = profile.notInterested.filter(id => id !== itemId);
      await setDoc(docRef, { notInterested: newNotInterested }, { merge: true });
    } catch (error) {
      console.error("Error removing not interested:", error);
    }
  };

  return { profile, loading, connectPartner, disconnectPartner, toggleNotInterested, removeNotInterested };
};

export const usePartnerProfile = (partnerUid: string | null | undefined) => {
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!partnerUid) {
      setPartnerProfile(null);
      return;
    }
    const docRef = doc(db, 'users', partnerUid);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setPartnerProfile(snap.data() as UserProfile);
      } else {
        setPartnerProfile(null);
      }
    });
    return () => unsubscribe();
  }, [partnerUid]);

  return partnerProfile;
};
