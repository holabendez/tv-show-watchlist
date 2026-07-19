import React, { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { getShowDetails, getSeasonWatchProviders, getShowWatchProviders, getImageUrl } from '../services/api';
import type { ShowDetails, Season, WatchProvidersResponse } from '../services/api';

interface ShowDetailsModalProps {
  showId: number;
  onClose: () => void;
  onAddSeason: (show: ShowDetails, season: Season, providers: WatchProvidersResponse | null) => void;
}

export const ShowDetailsModal: React.FC<ShowDetailsModalProps> = ({ showId, onClose, onAddSeason }) => {
  const [show, setShow] = useState<ShowDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [providersMap, setProvidersMap] = useState<Record<number, WatchProvidersResponse | null>>({});

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getShowDetails(showId);
      setShow(data);
      
      // Fetch providers for the overall show as a fallback
      const showProviders = await getShowWatchProviders(showId);

      // Fetch providers for each season
      const providers: Record<number, WatchProvidersResponse | null> = {};
      await Promise.all(data.seasons.map(async (season) => {
        // Skip season 0 (Specials) usually unless wanted, but let's just fetch it
        let seasonProviders = await getSeasonWatchProviders(showId, season.season_number);
        
        // TMDB often lacks season-level provider data. If it's missing or empty, fallback to show-level providers
        if (!seasonProviders || (!seasonProviders.flatrate?.length && !seasonProviders.buy?.length && !seasonProviders.rent?.length)) {
          seasonProviders = showProviders;
        }

        providers[season.id] = seasonProviders;
      }));
      setProvidersMap(providers);
      setLoading(false);
    };
    fetchDetails();
  }, [showId]);

  if (loading) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>Loading...</div>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{show.name} - Seasons</h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '8px' }}><X size={24} /></button>
        </div>
        
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {show.seasons.filter(s => s.season_number > 0).map((season) => (
            <div key={season.id} className="glass-panel" style={{ display: 'flex', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <img 
                src={getImageUrl(season.poster_path || show.poster_path, 'w200')} 
                alt={season.name} 
                style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} 
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>{season.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {season.overview || 'No overview available.'}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {providersMap[season.id]?.flatrate?.slice(0, 3).map(p => (
                      <img 
                        key={p.provider_id} 
                        src={`https://image.tmdb.org/t/p/original${p.logo_path}`} 
                        alt={p.provider_name}
                        title={p.provider_name}
                        style={{ width: '32px', height: '32px', borderRadius: '6px' }}
                      />
                    ))}
                    {(!providersMap[season.id]?.flatrate || providersMap[season.id]?.flatrate?.length === 0) && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No streaming data</span>
                    )}
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      onAddSeason(show, season, providersMap[season.id]);
                      onClose();
                    }}
                  >
                    <Plus size={18} /> Add to Watchlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
