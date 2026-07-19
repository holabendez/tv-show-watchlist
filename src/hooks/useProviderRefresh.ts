import { useEffect, useRef } from 'react';
import type { WatchlistItem, MovieWatchlistItem } from '../types';
import { getSeasonWatchProviders, getShowWatchProviders, getMovieWatchProviders } from '../services/api';

const REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useProviderRefresh = (
  userId: string | undefined,
  watchlist: WatchlistItem[],
  movieWatchlist: MovieWatchlistItem[],
  updateWatchlist: (action: WatchlistItem[] | ((prev: WatchlistItem[]) => WatchlistItem[])) => Promise<void>,
  updateMovieWatchlist: (action: MovieWatchlistItem[] | ((prev: MovieWatchlistItem[]) => MovieWatchlistItem[])) => Promise<void>
) => {
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Only run once per mount/session when userId is present
    if (!userId || hasRunRef.current) return;
    
    // We need to wait until the initial data is loaded. 
    // Since this effect depends on watchlist/movieWatchlist, it will re-trigger when they load.
    // If both are empty, it might be loading, or might just be empty. 
    // We'll proceed, but if it's truly empty, the filter just yields 0.
    
    const now = Date.now();
    
    const needsRefreshTV = watchlist.filter(item => 
      !item.providersUpdatedAt || (now - item.providersUpdatedAt > REFRESH_INTERVAL_MS)
    );
    
    const needsRefreshMovie = movieWatchlist.filter(item =>
      !item.providersUpdatedAt || (now - item.providersUpdatedAt > REFRESH_INTERVAL_MS)
    );
    
    // If nothing needs refresh, just return. But wait until we have at least checked once.
    // If the list is empty, we don't mark as run, so it can run when items load.
    if (watchlist.length === 0 && movieWatchlist.length === 0) {
      return; 
    }
    
    if (needsRefreshTV.length === 0 && needsRefreshMovie.length === 0) {
      hasRunRef.current = true; // Mark as checked for this session
      return;
    }
    
    hasRunRef.current = true; // Mark as running to avoid concurrent runs

    const refreshData = async () => {
      // Process TV Shows
      if (needsRefreshTV.length > 0) {
        const updatedTVItems: WatchlistItem[] = [];
        
        for (const item of needsRefreshTV) {
          try {
            const showProviders = await getShowWatchProviders(item.show.id);
            let seasonProviders = await getSeasonWatchProviders(item.show.id, item.season.season_number);
            
            if (!seasonProviders || (!seasonProviders.flatrate?.length && !seasonProviders.buy?.length && !seasonProviders.rent?.length)) {
              seasonProviders = showProviders;
            }
            
            updatedTVItems.push({
              ...item,
              providers: seasonProviders,
              providersUpdatedAt: now
            });
          } catch (e) {
            console.error(`Failed to refresh providers for ${item.show.name}`, e);
          }
        }
        
        if (updatedTVItems.length > 0) {
          updateWatchlist(prev => {
            const newPrev = [...prev];
            for (const updatedItem of updatedTVItems) {
              const idx = newPrev.findIndex(i => i.id === updatedItem.id);
              if (idx !== -1) {
                newPrev[idx] = { 
                  ...newPrev[idx], 
                  providers: updatedItem.providers, 
                  providersUpdatedAt: updatedItem.providersUpdatedAt 
                };
              }
            }
            return newPrev;
          });
        }
      }
      
      // Process Movies
      if (needsRefreshMovie.length > 0) {
        const updatedMovieItems: MovieWatchlistItem[] = [];
        
        for (const item of needsRefreshMovie) {
          try {
            const providers = await getMovieWatchProviders(item.movie.id);
            updatedMovieItems.push({
              ...item,
              providers,
              providersUpdatedAt: now
            });
          } catch (e) {
            console.error(`Failed to refresh providers for ${item.movie.title}`, e);
          }
        }
        
        if (updatedMovieItems.length > 0) {
          updateMovieWatchlist(prev => {
            const newPrev = [...prev];
            for (const updatedItem of updatedMovieItems) {
              const idx = newPrev.findIndex(i => i.id === updatedItem.id);
              if (idx !== -1) {
                newPrev[idx] = { 
                  ...newPrev[idx], 
                  providers: updatedItem.providers, 
                  providersUpdatedAt: updatedItem.providersUpdatedAt 
                };
              }
            }
            return newPrev;
          });
        }
      }
    };
    
    refreshData();
  }, [userId, watchlist, movieWatchlist, updateWatchlist, updateMovieWatchlist]);
};
