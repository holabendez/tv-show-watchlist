import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Matchmaker } from './Matchmaker';
import type { WatchlistItem } from '../types';
import { useWatchlist } from '../hooks/useWatchlist';

vi.mock('../hooks/useWatchlist');

describe('Matchmaker', () => {
  const mockShow = { id: 1, name: 'Test Show', poster_path: null, first_air_date: '', overview: '', seasons: [] };
  const mockSeason = { id: 101, name: 'Season 1', season_number: 1, episode_count: 10, poster_path: null, overview: '', air_date: '' };

  it('renders correctly when there are matches', () => {
    const mockItem: WatchlistItem = {
      id: '1-101',
      show: mockShow,
      season: mockSeason,
      providers: { flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.jpg' }] },
      addedAt: Date.now()
    };

    vi.mocked(useWatchlist).mockReturnValue({
      items: [mockItem],
      loading: false,
      updateWatchlist: vi.fn(),
    });

    render(<Matchmaker partnerUid="partner-123" userWatchlist={[mockItem]} />);
    
    expect(screen.getByText('Top Compromise Picks')).toBeInTheDocument();
    expect(screen.getByText('Test Show')).toBeInTheDocument();
    expect(screen.getByText('Season 1')).toBeInTheDocument();
    
    // Check provider rendering
    expect(screen.getByAltText('Netflix')).toBeInTheDocument();
  });

  it('renders "No streaming data" if providers are missing', () => {
    const mockItem: WatchlistItem = {
      id: '1-101',
      show: mockShow,
      season: mockSeason,
      providers: null,
      addedAt: Date.now()
    };

    vi.mocked(useWatchlist).mockReturnValue({
      items: [mockItem],
      loading: false,
      updateWatchlist: vi.fn(),
    });

    render(<Matchmaker partnerUid="partner-123" userWatchlist={[mockItem]} />);
    
    expect(screen.getByText('Test Show')).toBeInTheDocument();
    expect(screen.getByText('No streaming data')).toBeInTheDocument();
  });

  it('renders empty state if no matches', () => {
    vi.mocked(useWatchlist).mockReturnValue({
      items: [],
      loading: false,
      updateWatchlist: vi.fn(),
    });

    render(<Matchmaker partnerUid="partner-123" userWatchlist={[{
      id: '2-202',
      show: { ...mockShow, id: 2, name: 'Another Show' },
      season: { ...mockSeason, id: 202 },
      providers: null,
      addedAt: Date.now()
    }]} />);
    
    expect(screen.getByText('No Matches Found')).toBeInTheDocument();
    expect(screen.queryByText('Another Show')).not.toBeInTheDocument();
  });
});
