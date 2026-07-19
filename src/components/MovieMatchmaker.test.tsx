import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieMatchmaker } from './MovieMatchmaker';
import type { MovieWatchlistItem } from '../types';
import { useMovieWatchlist } from '../hooks/useMovieWatchlist';

vi.mock('../hooks/useMovieWatchlist');

describe('MovieMatchmaker', () => {
  const mockMovie = { id: 1, title: 'Test Movie', poster_path: null, release_date: '2024-01-01', overview: '' };

  it('renders correctly when there are matches', () => {
    const mockItem: MovieWatchlistItem = {
      id: 'movie-1',
      movie: mockMovie,
      providers: { flatrate: [{ provider_id: 350, provider_name: 'Apple TV', logo_path: '/apple.jpg' }] },
      addedAt: Date.now()
    };

    vi.mocked(useMovieWatchlist).mockReturnValue({
      items: [mockItem],
      loading: false,
      updateWatchlist: vi.fn(),
    });

    render(<MovieMatchmaker partnerUid="partner-123" userWatchlist={[mockItem]} />);
    
    expect(screen.getByText('Top Movie Compromise Picks')).toBeInTheDocument();
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    
    // Check provider rendering
    expect(screen.getByAltText('Apple TV')).toBeInTheDocument();
  });

  it('renders "No streaming data" if providers are missing', () => {
    const mockItem: MovieWatchlistItem = {
      id: 'movie-1',
      movie: mockMovie,
      providers: null,
      addedAt: Date.now()
    };

    vi.mocked(useMovieWatchlist).mockReturnValue({
      items: [mockItem],
      loading: false,
      updateWatchlist: vi.fn(),
    });

    render(<MovieMatchmaker partnerUid="partner-123" userWatchlist={[mockItem]} />);
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('No streaming data')).toBeInTheDocument();
  });

  it('renders empty state if no matches', () => {
    vi.mocked(useMovieWatchlist).mockReturnValue({
      items: [],
      loading: false,
      updateWatchlist: vi.fn(),
    });

    render(<MovieMatchmaker partnerUid="partner-123" userWatchlist={[{
      id: 'movie-2',
      movie: { ...mockMovie, id: 2, title: 'Another Movie' },
      providers: null,
      addedAt: Date.now()
    }]} />);
    
    expect(screen.getByText('No Movie Matches Found')).toBeInTheDocument();
    expect(screen.queryByText('Another Movie')).not.toBeInTheDocument();
  });
});
