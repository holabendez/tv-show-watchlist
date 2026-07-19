import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PartnerMovieWatchlist } from './PartnerMovieWatchlist';
import type { MovieWatchlistItem, WatchedMovieItem } from '../types';
import { useMovieWatchlist } from '../hooks/useMovieWatchlist';

vi.mock('../hooks/useMovieWatchlist');

describe('PartnerMovieWatchlist', () => {
  const mockItem: MovieWatchlistItem = {
    id: 'movie-1',
    movie: { id: 1, title: 'Test Movie', poster_path: null, release_date: '2024-01-01', overview: '' },
    providers: null,
  };

  const setup = (propsOverrides = {}, mockItems = [mockItem]) => {
    vi.mocked(useMovieWatchlist).mockReturnValue({
      items: mockItems,
      loading: false,
      updateWatchlist: vi.fn(),
    });

    const defaultProps = {
      partnerUid: 'partner-123',
      userWatchlist: [],
      onAdd: vi.fn(),
      onMarkNotInterested: vi.fn(),
      userNotInterestedIds: [],
      userWatchedItems: [],
      previousVisitTime: null,
      ...propsOverrides,
    };

    return render(<PartnerMovieWatchlist {...defaultProps} />);
  };

  it('renders correctly with default state', () => {
    setup();
    expect(screen.getByText('Partner\'s Movie Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    
    // Both buttons should be available
    expect(screen.getByTitle("Mark as Not Interested (they can watch without you)")).toBeInTheDocument();
    expect(screen.getByTitle('Add to my watchlist')).toBeInTheDocument();
  });

  it('does not show add/not interested buttons if item is in userWatchlist', () => {
    setup({ userWatchlist: [mockItem] });
    
    expect(screen.queryByTitle("Mark as Not Interested (they can watch without you)")).not.toBeInTheDocument();
    expect(screen.queryByTitle('Add to my watchlist')).not.toBeInTheDocument();
    expect(screen.getByText('In your list')).toBeInTheDocument();
  });

  it('shows checkmark when item is in userNotInterestedIds', () => {
    setup({ userNotInterestedIds: ['movie-1'] });
    
    expect(screen.getByTitle('Remove \'Not Interested\' flag')).toBeInTheDocument();
    expect(screen.getByText('You marked this as Not Interested')).toBeInTheDocument();
  });

  it('shows watched badge if item is already watched', () => {
    const mockWatchedItem: WatchedMovieItem = {
      ...mockItem,
      liked: true,
      watchedAt: Date.now()
    };
    setup({ userWatchedItems: [mockWatchedItem] });
    
    expect(screen.getByText('You watched this')).toBeInTheDocument();
    expect(screen.queryByTitle("Mark as Not Interested (they can watch without you)")).not.toBeInTheDocument();
    expect(screen.queryByTitle('Add to my watchlist')).not.toBeInTheDocument();
  });
  
  it('calls onMarkNotInterested when "Not Interested" button is clicked', () => {
    const onMarkNotInterested = vi.fn();
    setup({ onMarkNotInterested });
    
    fireEvent.click(screen.getByTitle("Mark as Not Interested (they can watch without you)"));
    expect(onMarkNotInterested).toHaveBeenCalledWith(mockItem);
  });
  
  it('calls onAdd when "Add" button is clicked', () => {
    const onAdd = vi.fn();
    setup({ onAdd });
    
    fireEvent.click(screen.getByTitle('Add to my watchlist'));
    expect(onAdd).toHaveBeenCalledWith(mockItem);
  });
});
