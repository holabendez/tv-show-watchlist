import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { WatchlistItem } from '../types';
import { getImageUrl } from '../services/api';

interface SeasonCardProps {
  item: WatchlistItem;
  rank: number;
  onRemove: (id: string) => void;
}

export const SeasonCard: React.FC<SeasonCardProps> = ({ item, rank, onRemove }) => {
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
    display: 'flex', 
    alignItems: 'center', 
    padding: '16px', 
    marginBottom: '12px',
    backgroundColor: isDragging ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-glass)',
    border: isDragging ? '1px solid var(--accent-color)' : '1px solid var(--border-glass)',
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="glass-panel">
      <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '0 8px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
        <GripVertical />
      </div>
      
      <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--accent-color)', width: '50px', textAlign: 'center', marginLeft: '8px' }}>
        #{rank}
      </div>

      <img 
        src={getImageUrl(item.season.poster_path || item.show.poster_path, 'w200')} 
        alt={item.season.name} 
        style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '6px', margin: '0 16px' }} 
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.show.name}</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.season.name}</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
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

      <button className="btn btn-ghost" onClick={() => onRemove(item.id)} style={{ color: 'var(--danger-color)' }}>
        <Trash2 size={20} />
      </button>
    </div>
  );
};
