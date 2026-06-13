import React from 'react';
import { useWatchlist } from '../hooks/useWatchlist';
import { Plus, Check, ListVideo } from 'lucide-react';
import type { WatchlistItem } from '../types';

interface PartnerWatchlistProps {
  partnerUid: string;
  userWatchlist: WatchlistItem[];
  onAdd: (item: WatchlistItem) => void;
}

export const PartnerWatchlist: React.FC<PartnerWatchlistProps> = ({ partnerUid, userWatchlist, onAdd }) => {
  const { items: partnerItems, loading } = useWatchlist(partnerUid);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading partner's watchlist...</div>;
  }

  if (partnerItems.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <ListVideo size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h3 style={{ margin: '0 0 8px 0' }}>Partner's List is Empty</h3>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Your partner hasn't added any seasons to their watchlist yet!
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <ListVideo size={32} color="var(--accent-color)" />
        <h2 style={{ margin: 0, fontSize: '2rem' }}>Partner's Watchlist</h2>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Browse what your partner wants to watch. See something interesting? Add it to your own list!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {partnerItems.map((item, index) => {
          const isAdded = userWatchlist.some(ui => ui.id === item.id);

          return (
            <div key={item.id} className="glass-panel" style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-secondary)', minWidth: '30px', textAlign: 'center' }}>
                {index + 1}
              </div>
              
              <img 
                src={`https://image.tmdb.org/t/p/w200${item.show.poster_path}`} 
                alt={item.show.name} 
                style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
              />
              
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{item.show.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Season {item.season.season_number}</p>
              </div>
              
              <button 
                className={`btn ${isAdded ? 'btn-ghost' : 'btn-primary'}`}
                onClick={() => !isAdded && onAdd(item)}
                disabled={isAdded}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isAdded ? (
                  <>
                    <Check size={18} color="var(--success-color)" /> Added
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Add to My List
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
