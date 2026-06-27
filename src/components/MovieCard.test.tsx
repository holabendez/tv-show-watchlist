import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieCard } from './MovieCard';
import type { MovieWatchlistItem } from '../types';

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

describe('MovieCard', () => {
  const mockItem: MovieWatchlistItem = {
    id: 'test-id',
    movie: { id: 1, title: 'Test Movie', poster_path: null, release_date: '2023-01-01', overview: '' },
    providers: null,
  };

  it('renders correctly with default state', () => {
    render(<MovieCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={vi.fn()} />);
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    
    // Default buttons
    expect(screen.getByTitle('Mark as Watched')).toBeInTheDocument();
    expect(screen.getByTitle('Remove')).toBeInTheDocument();
  });

  it('toggles rating UI when Mark as Watched is clicked', () => {
    render(<MovieCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={vi.fn()} />);
    
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
    render(<MovieCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={handleMarkWatched} />);
    
    fireEvent.click(screen.getByTitle('Mark as Watched'));
    fireEvent.click(screen.getByTitle('Thumbs Up'));
    
    expect(handleMarkWatched).toHaveBeenCalledWith(mockItem, true);
  });

  it('calls onMarkWatched with false when Thumbs Down is clicked', () => {
    const handleMarkWatched = vi.fn();
    render(<MovieCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={handleMarkWatched} />);
    
    fireEvent.click(screen.getByTitle('Mark as Watched'));
    fireEvent.click(screen.getByTitle('Thumbs Down'));
    
    expect(handleMarkWatched).toHaveBeenCalledWith(mockItem, false);
  });

  it('calls onMarkWatched with null when Skip is clicked', () => {
    const handleMarkWatched = vi.fn();
    render(<MovieCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={handleMarkWatched} />);
    
    fireEvent.click(screen.getByTitle('Mark as Watched'));
    fireEvent.click(screen.getByTitle('Skip Rating'));
    
    expect(handleMarkWatched).toHaveBeenCalledWith(mockItem, null);
  });

  it('hides rating UI when Cancel is clicked', () => {
    render(<MovieCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={vi.fn()} />);
    
    fireEvent.click(screen.getByTitle('Mark as Watched'));
    fireEvent.click(screen.getByTitle('Cancel'));
    
    expect(screen.queryByTitle('Thumbs Up')).not.toBeInTheDocument();
    expect(screen.getByTitle('Mark as Watched')).toBeInTheDocument();
  });

  it('renders partner watched nudge when partnerWatched is true', () => {
    render(<MovieCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={vi.fn()} partnerWatched={true} />);
    
    expect(screen.getByText('👀 Partner Watched')).toBeInTheDocument();
    const markWatchedBtn = screen.getByTitle('Mark as Watched');
    expect(markWatchedBtn).toHaveClass('nudge-pulse');
  });

  it('hides partner watched nudge when isMarkingWatched is true', () => {
    render(<MovieCard item={mockItem} rank={1} onRemove={vi.fn()} onMarkWatched={vi.fn()} partnerWatched={true} />);
    
    fireEvent.click(screen.getByTitle('Mark as Watched'));
    
    expect(screen.queryByText('👀 Partner Watched')).not.toBeInTheDocument();
  });
});
