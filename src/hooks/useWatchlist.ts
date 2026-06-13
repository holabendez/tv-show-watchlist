import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { WatchlistItem } from '../types';

export const useWatchlist = (userId: string | undefined) => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch watchlist on mount / when userId changes using real-time listener
  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, 'watchlists', userId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setItems(docSnap.data().items || []);
      } else {
        setItems([]);
      }
      setLoading(false);
    }, (error: any) => {
      console.error("Error fetching watchlist: ", error);
      if (error.code === 'permission-denied') {
        console.error("Firestore Permissions Denied. Please ensure your Firestore Security Rules allow read/write access.");
        alert("Could not load watchlist due to database permission issues. Please check your Firestore rules.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const updateWatchlist = async (action: WatchlistItem[] | ((prev: WatchlistItem[]) => WatchlistItem[])) => {
    if (!userId) return;

    // Resolve the new items, handling functional updates
    const newItems = typeof action === 'function' ? action(items) : action;

    // Optimistically update local state
    setItems(newItems);

    try {
      // Strip out any potentially undefined values that Firestore doesn't support
      const cleanItems = JSON.parse(JSON.stringify(newItems));
      const docRef = doc(db, 'watchlists', userId);
      await setDoc(docRef, { items: cleanItems });
    } catch (error: any) {
      console.error("Error saving watchlist: ", error);
      if (error?.code === 'permission-denied') {
        alert("Cannot save changes. Database permissions denied.");
      }
    }
  };

  return { items, updateWatchlist, loading };
};
