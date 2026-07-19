import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './services/firebase';
import { SearchBox } from './components/SearchBox';
import { MovieSearchBox } from './components/MovieSearchBox';
import { ShowDetailsModal } from './components/ShowDetailsModal';
import { Watchlist } from './components/Watchlist';
import { MovieWatchlist } from './components/MovieWatchlist';
import { Login } from './components/Login';
import { PartnerConnect } from './components/PartnerConnect';
import { Matchmaker } from './components/Matchmaker';
import { MovieMatchmaker } from './components/MovieMatchmaker';
import { PartnerWatchlist } from './components/PartnerWatchlist';
import { PartnerMovieWatchlist } from './components/PartnerMovieWatchlist';
import { useAuth } from './hooks/useAuth';
import { useWatchlist } from './hooks/useWatchlist';
import { useMovieWatchlist } from './hooks/useMovieWatchlist';
import { useWatched } from './hooks/useWatched';
import { useMovieWatched } from './hooks/useMovieWatched';
import { useProfile, usePartnerProfile } from './hooks/useProfile';
import { useProviderRefresh } from './hooks/useProviderRefresh';
import type { WatchlistItem, MovieWatchlistItem } from './types';
import { getMovieWatchProviders } from './services/api';
import type { ShowDetails, Season, WatchProvidersResponse, Movie } from './services/api';
import { LogOut, ListVideo, Users, HeartHandshake, Eye, Film } from 'lucide-react';
import confetti from 'canvas-confetti';

function App() {
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const { profile, loading: profileLoading, connectPartner, disconnectPartner, toggleNotInterested, removeNotInterested } = useProfile(user);
  const partnerProfile = usePartnerProfile(profile?.partnerUid);
  const { items: watchlist, updateWatchlist, loading: watchlistLoading } = useWatchlist(user?.uid);
  const { items: partnerWatchlist } = useWatchlist(profile?.partnerUid ?? undefined);
  const { items: watchedItems, addWatchedItem } = useWatched(user?.uid);
  const { items: partnerWatchedItems } = useWatched(profile?.partnerUid ?? undefined);
  const partnerWatchedIds = partnerWatchedItems.map(i => i.id);

  const { items: movieWatchlist, updateWatchlist: updateMovieWatchlist, loading: movieWatchlistLoading } = useMovieWatchlist(user?.uid);
  const { items: partnerMovieWatchlist } = useMovieWatchlist(profile?.partnerUid ?? undefined);
  const { items: watchedMovies, addWatchedItem: addWatchedMovie } = useMovieWatched(user?.uid);
  const { items: partnerWatchedMovies } = useMovieWatched(profile?.partnerUid ?? undefined);
  const partnerWatchedMovieIds = partnerWatchedMovies.map(i => i.id);
  
  // Start the background refresh process
  useProviderRefresh(user?.uid, watchlist, movieWatchlist, updateWatchlist, updateMovieWatchlist);
  
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'matches' | 'partner' | 'connect'>('watchlist');
  const [mediaType, setMediaType] = useState<'tv' | 'movie'>('tv');
  const [previousVisitTime, setPreviousVisitTime] = useState<number | null>(null);

  useEffect(() => {
    if (profile && previousVisitTime === null) {
      setPreviousVisitTime(profile.lastVisitedAt || 0);
      const docRef = doc(db, 'users', profile.uid);
      setDoc(docRef, { lastVisitedAt: Date.now() }, { merge: true }).catch(console.error);
    }
  }, [profile, previousVisitTime]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleAddSeason = (show: ShowDetails, season: Season, providers: WatchProvidersResponse | null) => {
    const newItem: WatchlistItem = {
      id: `${show.id}-${season.id}`,
      show,
      season,
      providers,
      addedAt: Date.now(),
      providersUpdatedAt: Date.now()
    };
    
    if (!watchlist.some(item => item.id === newItem.id)) {
      updateWatchlist(prev => [...prev, newItem]);
      removeNotInterested(newItem.id);
      
      if (partnerWatchlist.some(p => p.id === newItem.id)) {
        triggerConfetti();
      }
    }
  };

  const handleAddFromPartner = (item: WatchlistItem) => {
    if (!watchlist.some(existing => existing.id === item.id)) {
      updateWatchlist(prev => [...prev, { ...item, addedAt: Date.now(), providersUpdatedAt: Date.now() }]);
      removeNotInterested(item.id);
      triggerConfetti();
    }
  };

  const handleMarkWatched = (item: WatchlistItem, liked: boolean | null) => {
    addWatchedItem({ ...item, liked, watchedAt: Date.now() });
    updateWatchlist(prev => prev.filter(i => i.id !== item.id));
  };

  const handleAddMovie = async (movie: Movie) => {
    const providers = await getMovieWatchProviders(movie.id);
    const newItem: MovieWatchlistItem = {
      id: `movie-${movie.id}`,
      movie,
      providers,
      addedAt: Date.now(),
      providersUpdatedAt: Date.now()
    };
    
    if (!movieWatchlist.some(item => item.id === newItem.id)) {
      updateMovieWatchlist(prev => [...prev, newItem]);
      removeNotInterested(newItem.id);
      
      if (partnerMovieWatchlist.some(p => p.id === newItem.id)) {
        triggerConfetti();
      }
    }
  };

  const handleAddMovieFromPartner = (item: MovieWatchlistItem) => {
    if (!movieWatchlist.some(existing => existing.id === item.id)) {
      updateMovieWatchlist(prev => [...prev, { ...item, addedAt: Date.now(), providersUpdatedAt: Date.now() }]);
      removeNotInterested(item.id);
      triggerConfetti();
    }
  };

  const handleMarkMovieWatched = (item: MovieWatchlistItem, liked: boolean | null) => {
    addWatchedMovie({ ...item, liked, watchedAt: Date.now() });
    updateMovieWatchlist(prev => prev.filter(i => i.id !== item.id));
  };

  const handleMarkNotInterested = (item: { id: string }) => {
    toggleNotInterested(item.id);
  };

  if (authLoading || (user && profileLoading)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={loginWithGoogle} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 className="app-title">
            Watchlist Ranker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', margin: 0 }}>
            Curate and rank your ultimate TV and Movie watchlists
          </p>
        </div>
        <button onClick={logout} className="btn btn-ghost logout-btn" title="Sign Out" style={{ padding: '8px' }}>
          <LogOut size={20} />
        </button>
      </header>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          onClick={() => setActiveTab('watchlist')}
          className={`btn ${activeTab === 'watchlist' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '100px' }}
        >
          <ListVideo size={18} /> My List
        </button>
        <button 
          onClick={() => setActiveTab('matches')}
          className={`btn ${activeTab === 'matches' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '100px' }}
        >
          <HeartHandshake size={18} /> Matches
        </button>
        <button 
          onClick={() => setActiveTab('partner')}
          className={`btn ${activeTab === 'partner' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '120px' }}
        >
          <Eye size={18} /> Partner's List
        </button>
        <button 
          onClick={() => setActiveTab('connect')}
          className={`btn ${activeTab === 'connect' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '100px' }}
        >
          <Users size={18} /> Connect
        </button>
      </div>

      {activeTab !== 'connect' && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0', gap: '8px' }}>
          <button 
            onClick={() => setMediaType('tv')}
            className={`btn ${mediaType === 'tv' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '20px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ListVideo size={16} /> TV Shows
          </button>
          <button 
            onClick={() => setMediaType('movie')}
            className={`btn ${mediaType === 'movie' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '20px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Film size={16} /> Movies
          </button>
        </div>
      )}

      <main>
        {activeTab === 'watchlist' && mediaType === 'tv' && (
          <>
            <SearchBox onSelectShow={setSelectedShowId} />
            {watchlistLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading your watchlist...</div>
            ) : (
              <Watchlist 
                items={watchlist} 
                setItems={updateWatchlist} 
                onMarkWatched={handleMarkWatched} 
                partnerNotInterestedIds={partnerProfile?.notInterested || []} 
                partnerWatchedIds={partnerWatchedIds}
              />
            )}
          </>
        )}

        {activeTab === 'watchlist' && mediaType === 'movie' && (
          <>
            <MovieSearchBox onSelectMovie={handleAddMovie} />
            {movieWatchlistLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading your movie watchlist...</div>
            ) : (
              <MovieWatchlist 
                items={movieWatchlist} 
                setItems={updateMovieWatchlist} 
                onMarkWatched={handleMarkMovieWatched} 
                partnerNotInterestedIds={partnerProfile?.notInterested || []} 
                partnerWatchedIds={partnerWatchedMovieIds}
              />
            )}
          </>
        )}

        {activeTab === 'matches' && (
          profile?.partnerUid ? (
            mediaType === 'tv' ? 
              <Matchmaker partnerUid={profile.partnerUid} userWatchlist={watchlist} /> :
              <MovieMatchmaker partnerUid={profile.partnerUid} userWatchlist={movieWatchlist} />
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <HeartHandshake size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 8px 0' }}>No Partner Connected</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Connect with a partner to see your top compromise picks!</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('connect')}>Go to Connect</button>
            </div>
          )
        )}

        {activeTab === 'partner' && (
          profile?.partnerUid ? (
            mediaType === 'tv' ? (
              <PartnerWatchlist 
                partnerUid={profile.partnerUid} 
                userWatchlist={watchlist} 
                onAdd={handleAddFromPartner} 
                onMarkNotInterested={handleMarkNotInterested}
                userNotInterestedIds={profile?.notInterested || []}
                userWatchedItems={watchedItems}
                previousVisitTime={previousVisitTime}
              />
            ) : (
              <PartnerMovieWatchlist 
                partnerUid={profile.partnerUid} 
                userWatchlist={movieWatchlist} 
                onAdd={handleAddMovieFromPartner} 
                onMarkNotInterested={handleMarkNotInterested}
                userNotInterestedIds={profile?.notInterested || []}
                userWatchedItems={watchedMovies}
                previousVisitTime={previousVisitTime}
              />
            )
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <Eye size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 8px 0' }}>No Partner Connected</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Connect with a partner to view and browse their watchlist!</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('connect')}>Go to Connect</button>
            </div>
          )
        )}

        {activeTab === 'connect' && profile && (
          <PartnerConnect profile={profile} onConnect={connectPartner} onDisconnect={disconnectPartner} />
        )}
      </main>

      {selectedShowId && (
        <ShowDetailsModal showId={selectedShowId} onClose={() => setSelectedShowId(null)} onAddSeason={handleAddSeason} />
      )}
    </div>
  );
}

export default App;
