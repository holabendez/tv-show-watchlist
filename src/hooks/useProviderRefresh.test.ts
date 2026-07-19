import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProviderRefresh } from './useProviderRefresh';
import { getSeasonWatchProviders, getShowWatchProviders, getMovieWatchProviders } from '../services/api';
import type { WatchlistItem, MovieWatchlistItem } from '../types';

vi.mock('../services/api');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

describe('useProviderRefresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not run if userId is undefined', async () => {
    const updateWatchlist = vi.fn();
    const updateMovieWatchlist = vi.fn();
    
    renderHook(() => useProviderRefresh(
      undefined,
      [],
      [],
      updateWatchlist,
      updateMovieWatchlist
    ));
    
    expect(getShowWatchProviders).not.toHaveBeenCalled();
    expect(getMovieWatchProviders).not.toHaveBeenCalled();
  });

  it('should fetch new providers for items without providersUpdatedAt', async () => {
    const mockShowProvider = { flatrate: [{ provider_id: 1, provider_name: 'Netflix', logo_path: '/n.jpg' }] };
    vi.mocked(getShowWatchProviders).mockResolvedValue(mockShowProvider as any);
    vi.mocked(getSeasonWatchProviders).mockResolvedValue(mockShowProvider as any);
    
    const mockItem: WatchlistItem = {
      id: '1-1',
      show: { id: 1, name: 'Test Show', poster_path: null, first_air_date: '', overview: '', seasons: [] },
      season: { id: 1, name: 'Season 1', season_number: 1, episode_count: 10, poster_path: null, overview: '', air_date: '' },
      providers: null
    };

    const updateWatchlist = vi.fn();
    const updateMovieWatchlist = vi.fn();
    
    renderHook(() => useProviderRefresh(
      'user-123',
      [mockItem],
      [],
      updateWatchlist,
      updateMovieWatchlist
    ));
    
    await waitFor(() => {
      expect(getShowWatchProviders).toHaveBeenCalledWith(1);
      expect(updateWatchlist).toHaveBeenCalled();
    });
  });

  it('should not fetch if providersUpdatedAt is recent', async () => {
    const mockItem: WatchlistItem = {
      id: '1-1',
      show: { id: 1, name: 'Test Show', poster_path: null, first_air_date: '', overview: '', seasons: [] },
      season: { id: 1, name: 'Season 1', season_number: 1, episode_count: 10, poster_path: null, overview: '', air_date: '' },
      providers: null,
      providersUpdatedAt: Date.now() - 1000 // 1 second ago
    };

    const updateWatchlist = vi.fn();
    const updateMovieWatchlist = vi.fn();
    
    renderHook(() => useProviderRefresh(
      'user-123',
      [mockItem],
      [],
      updateWatchlist,
      updateMovieWatchlist
    ));
    
    expect(getShowWatchProviders).not.toHaveBeenCalled();
    expect(updateWatchlist).not.toHaveBeenCalled();
  });

  it('should fetch if providersUpdatedAt is older than 7 days', async () => {
    const mockMovieProvider = { flatrate: [{ provider_id: 1, provider_name: 'Hulu', logo_path: '/h.jpg' }] };
    vi.mocked(getMovieWatchProviders).mockResolvedValue(mockMovieProvider as any);
    
    const mockDate = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(mockDate);

    const mockItem: MovieWatchlistItem = {
      id: 'movie-1',
      movie: { id: 1, title: 'Test Movie', poster_path: null, release_date: '2024-01-01', overview: '' },
      providers: null,
      providersUpdatedAt: mockDate - SEVEN_DAYS_MS - 1000 // 7 days and 1 second ago
    };

    const updateWatchlist = vi.fn();
    const updateMovieWatchlist = vi.fn();
    
    renderHook(() => useProviderRefresh(
      'user-123',
      [],
      [mockItem],
      updateWatchlist,
      updateMovieWatchlist
    ));
    
    await waitFor(() => {
      expect(getMovieWatchProviders).toHaveBeenCalledWith(1);
      expect(updateMovieWatchlist).toHaveBeenCalled();
    });
  });

  it('should fallback to show providers if season providers are empty', async () => {
    const mockShowProvider = { flatrate: [{ provider_id: 1, provider_name: 'Max', logo_path: '/m.jpg' }] };
    const mockEmptySeasonProvider = { flatrate: [], buy: [], rent: [] };
    
    vi.mocked(getShowWatchProviders).mockResolvedValue(mockShowProvider as any);
    vi.mocked(getSeasonWatchProviders).mockResolvedValue(mockEmptySeasonProvider as any);
    
    const mockItem: WatchlistItem = {
      id: '1-1',
      show: { id: 1, name: 'Test Show', poster_path: null, first_air_date: '', overview: '', seasons: [] },
      season: { id: 1, name: 'Season 1', season_number: 1, episode_count: 10, poster_path: null, overview: '', air_date: '' },
      providers: null
    };

    const updateWatchlist = vi.fn().mockImplementation((cb) => {
      // Simulate state update
      const result = cb([mockItem]);
      expect(result[0].providers).toEqual(mockShowProvider);
    });
    
    const updateMovieWatchlist = vi.fn();
    
    renderHook(() => useProviderRefresh(
      'user-123',
      [mockItem],
      [],
      updateWatchlist,
      updateMovieWatchlist
    ));
    
    await waitFor(() => {
      expect(getShowWatchProviders).toHaveBeenCalledWith(1);
      expect(getSeasonWatchProviders).toHaveBeenCalledWith(1, 1);
      expect(updateWatchlist).toHaveBeenCalled();
    });
  });
});
