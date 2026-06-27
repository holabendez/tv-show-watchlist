import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { MovieWatchlistItem } from '../types';

export const useMovieWatchlist = (userId: string | undefined) => {
  const [items, setItems] = useState<MovieWatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch watchlist on mount / when userId changes using real-time listener
  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, 'movie-watchlists', userId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setItems(docSnap.data().items || []);
      } else {
        setItems([]);
      }
      setLoading(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, (error: any) => {
      console.error("Error fetching movie watchlist: ", error);
      if (error.code === 'permission-denied') {
        console.error("Firestore Permissions Denied. Please ensure your Firestore Security Rules allow read/write access.");
        alert("Could not load movie watchlist due to database permission issues. Please check your Firestore rules.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const updateWatchlist = async (action: MovieWatchlistItem[] | ((prev: MovieWatchlistItem[]) => MovieWatchlistItem[])) => {
    if (!userId) return;

    // Resolve the new items, handling functional updates
    const newItems = typeof action === 'function' ? action(items) : action;

    // Optimistically update local state
    setItems(newItems);

    try {
      // Strip out any potentially undefined values that Firestore doesn't support
      const cleanItems = JSON.parse(JSON.stringify(newItems));
      const docRef = doc(db, 'movie-watchlists', userId);
      await setDoc(docRef, { items: cleanItems });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error saving movie watchlist: ", error);
      if (error?.code === 'permission-denied') {
        alert("Cannot save changes. Database permissions denied.");
      }
    }
  };

  return { items, updateWatchlist, loading };
};
