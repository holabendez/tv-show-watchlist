import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { WatchedItem } from '../types';

export const useWatched = (userId: string | undefined) => {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, 'watched', userId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setItems(docSnap.data().items || []);
      } else {
        setItems([]);
      }
      setLoading(false);
    }, (error: any) => {
      console.error("Error fetching watched list: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addWatchedItem = async (item: WatchedItem) => {
    if (!userId) return;

    // Optimistically add
    const newItems = [...items, item];
    setItems(newItems);

    try {
      const docRef = doc(db, 'watched', userId);
      const cleanItems = JSON.parse(JSON.stringify(newItems));
      await setDoc(docRef, { items: cleanItems }, { merge: true });
    } catch (error: any) {
      console.error("Error saving watched item: ", error);
    }
  };

  return { items, addWatchedItem, loading };
};
