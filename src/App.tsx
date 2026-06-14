import { useState } from 'react';
import { SearchBox } from './components/SearchBox';
import { ShowDetailsModal } from './components/ShowDetailsModal';
import { Watchlist } from './components/Watchlist';
import { Login } from './components/Login';
import { PartnerConnect } from './components/PartnerConnect';
import { Matchmaker } from './components/Matchmaker';
import { PartnerWatchlist } from './components/PartnerWatchlist';
import { useAuth } from './hooks/useAuth';
import { useWatchlist } from './hooks/useWatchlist';
import { useProfile } from './hooks/useProfile';
import type { WatchlistItem } from './types';
import type { ShowDetails, Season, WatchProvidersResponse } from './services/api';
import { LogOut, ListVideo, Users, HeartHandshake, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

function App() {
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const { profile, loading: profileLoading, connectPartner, disconnectPartner } = useProfile(user);
  const { items: watchlist, updateWatchlist, loading: watchlistLoading } = useWatchlist(user?.uid);
  const { items: partnerWatchlist } = useWatchlist(profile?.partnerUid ?? undefined);
  
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'matches' | 'partner' | 'connect'>('watchlist');

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
      providers
    };
    
    if (!watchlist.some(item => item.id === newItem.id)) {
      updateWatchlist(prev => [...prev, newItem]);
      
      if (partnerWatchlist.some(p => p.id === newItem.id)) {
        triggerConfetti();
      }
    }
  };

  const handleAddFromPartner = (item: WatchlistItem) => {
    if (!watchlist.some(existing => existing.id === item.id)) {
      updateWatchlist(prev => [...prev, item]);
      triggerConfetti();
    }
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', margin: '0 0 8px 0', background: 'linear-gradient(to right, var(--accent-color), #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Season Ranker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', margin: 0 }}>
            Curate and rank your ultimate TV season watchlist
          </p>
        </div>
        <button onClick={logout} className="btn btn-ghost" title="Sign Out" style={{ padding: '8px', position: 'absolute', right: '20px', top: '20px' }}>
          <LogOut size={20} />
        </button>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border-glass)', overflowX: 'auto' }}>
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

      <main>
        {activeTab === 'watchlist' && (
          <>
            <SearchBox onSelectShow={setSelectedShowId} />
            {watchlistLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading your watchlist...</div>
            ) : (
              <Watchlist items={watchlist} setItems={updateWatchlist} />
            )}
          </>
        )}

        {activeTab === 'matches' && (
          profile?.partnerUid ? (
            <Matchmaker partnerUid={profile.partnerUid} userWatchlist={watchlist} />
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
            <PartnerWatchlist partnerUid={profile.partnerUid} userWatchlist={watchlist} onAdd={handleAddFromPartner} />
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
