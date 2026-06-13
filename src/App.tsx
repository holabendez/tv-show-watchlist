import { useState, useEffect } from 'react';
import { SearchBox } from './components/SearchBox';
import { ShowDetailsModal } from './components/ShowDetailsModal';
import { Watchlist } from './components/Watchlist';
import type { WatchlistItem } from './types';
import type { ShowDetails, Season, WatchProvidersResponse } from './services/api';

function App() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('tv-watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('tv-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const handleAddSeason = (show: ShowDetails, season: Season, providers: WatchProvidersResponse | null) => {
    const newItem: WatchlistItem = {
      id: `${show.id}-${season.id}`,
      show,
      season,
      providers
    };
    
    // Check if already in watchlist
    if (!watchlist.some(item => item.id === newItem.id)) {
      setWatchlist(prev => [...prev, newItem]);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '8px', background: 'linear-gradient(to right, var(--accent-color), #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Season Ranker
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Curate and rank your ultimate TV season watchlist
        </p>
      </header>

      <main>
        <SearchBox onSelectShow={setSelectedShowId} />
        <Watchlist items={watchlist} setItems={setWatchlist} />
      </main>

      {selectedShowId && (
        <ShowDetailsModal 
          showId={selectedShowId} 
          onClose={() => setSelectedShowId(null)}
          onAddSeason={handleAddSeason}
        />
      )}
    </div>
  );
}

export default App;
