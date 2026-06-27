import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { MovieWatchlistItem } from '../types';
import { MovieCard } from './MovieCard';

interface MovieWatchlistProps {
  items: MovieWatchlistItem[];
  setItems: React.Dispatch<React.SetStateAction<MovieWatchlistItem[]>>;
  onMarkWatched: (item: MovieWatchlistItem, liked: boolean | null) => void;
  partnerNotInterestedIds: string[];
  partnerWatchedIds: string[];
}

export const MovieWatchlist: React.FC<MovieWatchlistProps> = ({ items, setItems, onMarkWatched, partnerNotInterestedIds, partnerWatchedIds }) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex(item => item.id === active.id);
        const newIndex = currentItems.findIndex(item => item.id === over.id);
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  };

  const handleRemove = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '24px' }}>
        <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Your movie watchlist is empty</h3>
        <p>Search for a movie above and add it to start ranking!</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '32px' }}>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((item, index) => (
              <MovieCard 
                key={item.id} 
                item={item} 
                rank={index + 1} 
                onRemove={handleRemove} 
                onMarkWatched={onMarkWatched}
                partnerNotInterested={partnerNotInterestedIds.includes(item.id)}
                partnerWatched={partnerWatchedIds.includes(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
