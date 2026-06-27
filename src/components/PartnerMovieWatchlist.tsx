import React, { useMemo } from 'react';
import { useMovieWatchlist } from '../hooks/useMovieWatchlist';
import { EyeOff, Plus, Check } from 'lucide-react';
import type { MovieWatchlistItem, WatchedMovieItem } from '../types';

interface PartnerMovieWatchlistProps {
  partnerUid: string;
  userWatchlist: MovieWatchlistItem[];
  onAdd: (item: MovieWatchlistItem) => void;
  onMarkNotInterested: (item: MovieWatchlistItem) => void;
  userNotInterestedIds: string[];
  userWatchedItems: WatchedMovieItem[];
}

export const PartnerMovieWatchlist: React.FC<PartnerMovieWatchlistProps> = ({ 
  partnerUid, 
  userWatchlist, 
  onAdd, 
  onMarkNotInterested,
  userNotInterestedIds,
  userWatchedItems
}) => {
  const { items: partnerWatchlist, loading } = useMovieWatchlist(partnerUid);

  const userWatchlistIds = useMemo(() => userWatchlist.map(i => i.id), [userWatchlist]);
  const userWatchedIds = useMemo(() => userWatchedItems.map(i => i.id), [userWatchedItems]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading partner's movie watchlist...</div>;
  }

  if (partnerWatchlist.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Your partner's movie watchlist is empty</h3>
        <p>Tell them to add some movies so you can find matches!</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>Partner's Movie Watchlist</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {partnerWatchlist.map((item, index) => {
          const inMyList = userWatchlistIds.includes(item.id);
          const isNotInterested = userNotInterestedIds.includes(item.id);
          const hasWatched = userWatchedIds.includes(item.id);

          return (
            <div key={item.id} className="glass-panel" style={{ 
              display: 'flex', 
              gap: '16px', 
              padding: '16px', 
              alignItems: 'center',
              opacity: isNotInterested ? 0.6 : 1,
              border: inMyList ? '1px solid var(--accent-color)' : '1px solid var(--border-glass)'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '1.2rem', 
                color: 'var(--text-secondary)',
                width: '30px'
              }}>
                #{index + 1}
              </div>
              
              <img 
                src={`https://image.tmdb.org/t/p/w200${item.movie.poster_path}`} 
                alt={item.movie.title} 
                style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
              />
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', textDecoration: isNotInterested ? 'line-through' : 'none' }}>
                    {item.movie.title}
                  </h3>
                  {inMyList && (
                    <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-color)', padding: '2px 6px', borderRadius: '4px' }}>
                      In your list
                    </span>
                  )}
                  {hasWatched && (
                    <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)', padding: '2px 6px', borderRadius: '4px' }}>
                      You watched this
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  {item.movie.release_date ? item.movie.release_date.substring(0, 4) : ''}
                </p>
                {isNotInterested && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--danger-color)' }}>
                    You marked this as Not Interested
                  </p>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {!inMyList && !hasWatched && (
                  <>
                    <button 
                      className="btn btn-ghost"
                      onClick={() => onAdd(item)}
                      style={{ color: 'var(--accent-color)', padding: '8px' }}
                      title="Add to my watchlist"
                    >
                      <Plus size={20} />
                    </button>
                    <button 
                      className={`btn btn-ghost ${isNotInterested ? 'btn-primary' : ''}`}
                      onClick={() => onMarkNotInterested(item)}
                      style={{ color: isNotInterested ? '#fff' : 'var(--text-secondary)', padding: '8px' }}
                      title={isNotInterested ? "Remove 'Not Interested' flag" : "Mark as Not Interested (they can watch without you)"}
                    >
                      {isNotInterested ? <Check size={20} /> : <EyeOff size={20} />}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
