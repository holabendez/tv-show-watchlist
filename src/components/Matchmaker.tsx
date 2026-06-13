import React, { useMemo } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';
import { HeartHandshake } from 'lucide-react';
import type { WatchlistItem } from '../types';

interface MatchmakerProps {
  partnerUid: string;
  userWatchlist: WatchlistItem[];
}

export const Matchmaker: React.FC<MatchmakerProps> = ({ partnerUid, userWatchlist }) => {
  const { items: partnerWatchlist, loading } = useWatchlist(partnerUid);

  const matches = useMemo(() => {
    if (!partnerWatchlist.length || !userWatchlist.length) return [];

    const intersection = userWatchlist.map((item, userIndex) => {
      const partnerIndex = partnerWatchlist.findIndex(p => p.id === item.id);
      
      if (partnerIndex !== -1) {
        return {
          item,
          userRank: userIndex + 1,
          partnerRank: partnerIndex + 1,
          score: (userIndex + 1) + (partnerIndex + 1)
        };
      }
      return null;
    }).filter((m): m is NonNullable<typeof m> => m !== null);

    // Sort by lowest combined score first
    return intersection.sort((a, b) => a.score - b.score);
  }, [userWatchlist, partnerWatchlist]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading partner's watchlist...</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <HeartHandshake size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h3 style={{ margin: '0 0 8px 0' }}>No Matches Found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          You and your partner don't have any overlapping seasons in your watchlists yet. Start adding some mutual interests!
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <HeartHandshake size={32} color="var(--accent-color)" />
        <h2 style={{ margin: 0, fontSize: '2rem' }}>Top Compromise Picks</h2>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        These are the seasons both of you want to watch, ranked mathematically to find the best compromise for movie night.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {matches.map((match, idx) => (
          <div key={match.item.id} className="glass-panel" style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--accent-color), #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '1.2rem', color: '#fff'
            }}>
              #{idx + 1}
            </div>
            
            <img 
              src={`https://image.tmdb.org/t/p/w200${match.item.show.poster_path}`} 
              alt={match.item.show.name} 
              style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
            />
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{match.item.show.name}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Season {match.item.season.season_number}</p>
            </div>
            
            <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>Your Rank: <strong>#{match.userRank}</strong></div>
              <div>Partner's Rank: <strong>#{match.partnerRank}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
