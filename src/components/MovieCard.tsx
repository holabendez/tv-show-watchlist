import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Eye, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import type { MovieWatchlistItem } from '../types';
import { getImageUrl } from '../services/api';

interface MovieCardProps {
  item: MovieWatchlistItem;
  rank: number;
  onRemove: (id: string) => void;
  onMarkWatched: (item: MovieWatchlistItem, liked: boolean | null) => void;
  partnerNotInterested?: boolean;
  partnerWatched?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, rank, onRemove, onMarkWatched, partnerNotInterested, partnerWatched }) => {
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-glass)',
    border: isDragging ? '1px solid var(--accent-color)' : '1px solid var(--border-glass)',
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="glass-panel season-card">
      <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '0 8px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', touchAction: 'none' }}>
        <GripVertical />
      </div>
      
      <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--accent-color)', width: '50px', textAlign: 'center', marginLeft: '8px' }}>
        #{rank}
      </div>

      <img 
        src={getImageUrl(item.movie.poster_path, 'w200')} 
        alt={item.movie.title} 
        style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '6px', margin: '0 16px' }} 
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.movie.title}</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.movie.release_date ? item.movie.release_date.substring(0, 4) : 'Unknown Year'}
        </p>
      </div>

      <div className="season-card-actions">
        {partnerNotInterested && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '1.5rem',
              cursor: 'help'
            }}
            title="Your partner is not interested in watching this"
          >
            🙈
          </div>
        )}

        {partnerWatched && !isMarkingWatched && (
          <div style={{ 
            fontSize: '0.8rem', 
            backgroundColor: 'rgba(139, 92, 246, 0.2)', 
            color: 'var(--accent-color)', 
            padding: '4px 8px', 
            borderRadius: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap'
          }} title="Your partner has marked this as watched!">
            👀 Partner Watched
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          {item.providers?.flatrate?.slice(0, 3).map(p => (
            <img 
              key={p.provider_id} 
              src={`https://image.tmdb.org/t/p/original${p.logo_path}`} 
              alt={p.provider_name}
              title={p.provider_name}
              style={{ width: '32px', height: '32px', borderRadius: '6px' }}
            />
          ))}
        </div>

        {isMarkingWatched ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '4px' }}>Rate:</span>
            <button className="btn btn-ghost" onClick={() => onMarkWatched(item, true)} style={{ color: 'var(--success-color)', padding: '6px' }} title="Thumbs Up">
              <ThumbsUp size={18} />
            </button>
            <button className="btn btn-ghost" onClick={() => onMarkWatched(item, false)} style={{ color: 'var(--danger-color)', padding: '6px' }} title="Thumbs Down">
              <ThumbsDown size={18} />
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-glass)', margin: '0 4px' }} />
            <button className="btn btn-ghost" onClick={() => onMarkWatched(item, null)} style={{ color: 'var(--text-secondary)', padding: '6px', fontSize: '0.9rem' }} title="Skip Rating">
              Skip
            </button>
            <button className="btn btn-ghost" onClick={() => setIsMarkingWatched(false)} style={{ color: 'var(--text-secondary)', padding: '6px' }} title="Cancel">
              <X size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className={`btn btn-ghost ${partnerWatched ? 'nudge-pulse' : ''}`} onClick={() => setIsMarkingWatched(true)} style={{ color: 'var(--accent-color)' }} title="Mark as Watched">
              <Eye size={20} />
            </button>
            <button className="btn btn-ghost" onClick={() => onRemove(item.id)} style={{ color: 'var(--danger-color)' }} title="Remove">
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
