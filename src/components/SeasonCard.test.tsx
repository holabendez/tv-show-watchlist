import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SeasonCard } from './SeasonCard';
import type { WatchlistItem } from '../types';

// Mock dnd-kit since we are only testing the UI interactions
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

// Mock the API helper
vi.mock('../services/api', () => ({
  getImageUrl: () => 'mocked-url.jpg',
}));

describe('SeasonCard', () => {
  const mockItem: WatchlistItem = {
    id: 'test-id',
    show: { id: 1, name: 'Test Show', poster_path: null, first_air_date: '', overview: '', seasons: [] },
    season: { id: 101, name: 'Season 1', season_number: 1, episode_count: 10, poster_path: null, overview: '', air_date: '' },
    providers: null,
  };

  it('renders correctly with default state', () => {
    render(<SeasonCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={vi.fn()} />);
    
    expect(screen.getByText('Test Show')).toBeInTheDocument();
    expect(screen.getByText('Season 1')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    
    // Default buttons
    expect(screen.getByTitle('Mark as Watched')).toBeInTheDocument();
    expect(screen.getByTitle('Remove')).toBeInTheDocument();
  });

  it('toggles rating UI when Mark as Watched is clicked', () => {
    render(<SeasonCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={vi.fn()} />);
    
    const markWatchedBtn = screen.getByTitle('Mark as Watched');
    fireEvent.click(markWatchedBtn);
    
    // Rating buttons should appear
    expect(screen.getByTitle('Thumbs Up')).toBeInTheDocument();
    expect(screen.getByTitle('Thumbs Down')).toBeInTheDocument();
    expect(screen.getByTitle('Skip Rating')).toBeInTheDocument();
    expect(screen.getByTitle('Cancel')).toBeInTheDocument();
    
    // Old buttons should disappear
    expect(screen.queryByTitle('Mark as Watched')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Remove')).not.toBeInTheDocument();
  });

  it('calls onMarkWatched with true when Thumbs Up is clicked', () => {
    const handleMarkWatched = vi.fn();
    render(<SeasonCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={handleMarkWatched} />);
    
    fireEvent.click(screen.getByTitle('Mark as Watched'));
    fireEvent.click(screen.getByTitle('Thumbs Up'));
    
    expect(handleMarkWatched).toHaveBeenCalledWith(mockItem, true);
  });

  it('calls onMarkWatched with false when Thumbs Down is clicked', () => {
    const handleMarkWatched = vi.fn();
    render(<SeasonCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={handleMarkWatched} />);
    
    fireEvent.click(screen.getByTitle('Mark as Watched'));
    fireEvent.click(screen.getByTitle('Thumbs Down'));
    
    expect(handleMarkWatched).toHaveBeenCalledWith(mockItem, false);
  });

  it('calls onMarkWatched with null when Skip is clicked', () => {
    const handleMarkWatched = vi.fn();
    render(<SeasonCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={handleMarkWatched} />);
    
    fireEvent.click(screen.getByTitle('Mark as Watched'));
    fireEvent.click(screen.getByTitle('Skip Rating'));
    
    expect(handleMarkWatched).toHaveBeenCalledWith(mockItem, null);
  });

  it('hides rating UI when Cancel is clicked', () => {
    render(<SeasonCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={vi.fn()} />);
    
    fireEvent.click(screen.getByTitle('Mark as Watched'));
    fireEvent.click(screen.getByTitle('Cancel'));
    
    expect(screen.queryByTitle('Thumbs Up')).not.toBeInTheDocument();
    expect(screen.getByTitle('Mark as Watched')).toBeInTheDocument();
  });
});
