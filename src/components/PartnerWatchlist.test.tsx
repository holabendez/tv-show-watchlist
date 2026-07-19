import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PartnerWatchlist } from './PartnerWatchlist';
import type { WatchlistItem, WatchedItem } from '../types';
import { useWatchlist } from '../hooks/useWatchlist';

vi.mock('../hooks/useWatchlist');

describe('PartnerWatchlist', () => {
  const mockItem: WatchlistItem = {
    id: '1-101',
    show: { id: 1, name: 'Test Show', poster_path: null, first_air_date: '', overview: '', seasons: [] },
    season: { id: 101, name: 'Season 1', season_number: 1, episode_count: 10, poster_path: null, overview: '', air_date: '' },
    providers: null,
  };

  const setup = (propsOverrides = {}, mockItems = [mockItem]) => {
    vi.mocked(useWatchlist).mockReturnValue({
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

    return render(<PartnerWatchlist {...defaultProps} />);
  };

  it('renders correctly with default state', () => {
    setup();
    expect(screen.getByText('Partner\'s Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Test Show')).toBeInTheDocument();
    
    // Both buttons should be available
    expect(screen.getByTitle('Mark as Not Interested')).toBeInTheDocument();
    expect(screen.getByText('Add to My List')).toBeInTheDocument();
  });

  it('disables "Not Interested" and "Add to My List" buttons if item is in userWatchlist', () => {
    setup({ userWatchlist: [mockItem] });
    
    const notInterestedBtn = screen.getByTitle("You cannot mark an item as not interested if it's on your watchlist");
    expect(notInterestedBtn).toBeDisabled();
    
    const addedBtn = screen.getByText('Added');
    expect(addedBtn.closest('button')).toBeDisabled();
  });

  it('shows "Undo" when item is in userNotInterestedIds', () => {
    setup({ userNotInterestedIds: ['1-101'] });
    
    expect(screen.getByTitle('Undo Not Interested')).toBeInTheDocument();
    expect(screen.getByText('🙈 Undo')).toBeInTheDocument();
  });

  it('replaces buttons with "Watched" badge if item is already watched', () => {
    const mockWatchedItem: WatchedItem = {
      ...mockItem,
      liked: true,
      watchedAt: Date.now()
    };
    setup({ userWatchedItems: [mockWatchedItem] });
    
    expect(screen.getByText('Watched')).toBeInTheDocument();
    expect(screen.queryByTitle('Mark as Not Interested')).not.toBeInTheDocument();
    expect(screen.queryByText('Add to My List')).not.toBeInTheDocument();
  });
  
  it('calls onMarkNotInterested when "Not Interested" button is clicked', () => {
    const onMarkNotInterested = vi.fn();
    setup({ onMarkNotInterested });
    
    fireEvent.click(screen.getByTitle('Mark as Not Interested'));
    expect(onMarkNotInterested).toHaveBeenCalledWith(mockItem);
  });
  
  it('calls onAdd when "Add to My List" button is clicked', () => {
    const onAdd = vi.fn();
    setup({ onAdd });
    
    fireEvent.click(screen.getByText('Add to My List'));
    expect(onAdd).toHaveBeenCalledWith(mockItem);
  });
});
