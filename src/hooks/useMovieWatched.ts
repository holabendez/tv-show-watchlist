import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { WatchedMovieItem } from '../types';

export const useMovieWatched = (userId: string | undefined) => {
  const [items, setItems] = useState<WatchedMovieItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, 'movie-watched', userId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setItems(docSnap.data().items || []);
      } else {
        setItems([]);
      }
      setLoading(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, (error: any) => {
      console.error("Error fetching watched movie list: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addWatchedItem = async (item: WatchedMovieItem) => {
    if (!userId) return;

    // Optimistically add
    const newItems = [...items, item];
    setItems(newItems);

    try {
      const docRef = doc(db, 'movie-watched', userId);
      const cleanItems = JSON.parse(JSON.stringify(newItems));
      await setDoc(docRef, { items: cleanItems }, { merge: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error saving watched movie item: ", error);
    }
  };

  return { items, addWatchedItem, loading };
};
