import React, { useState } from 'react';
import { Copy, UserPlus, Users, Link2Off } from 'lucide-react';
import type { UserProfile } from '../types';

interface PartnerConnectProps {
  profile: UserProfile;
  onConnect: (code: string) => Promise<boolean>;
  onDisconnect: () => Promise<boolean>;
}

export const PartnerConnect: React.FC<PartnerConnectProps> = ({ profile, onConnect, onDisconnect }) => {
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCodeInput.trim()) return;
    
    setLoading(true);
    const success = await onConnect(partnerCodeInput.trim());
    if (success) {
      setPartnerCodeInput('');
      alert("Successfully connected to partner!");
    } else {
      alert("Failed to connect. Make sure the code is correct.");
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (window.confirm("Are you sure you want to disconnect from this partner?")) {
      await onDisconnect();
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Your Code Section */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Users size={24} color="var(--accent-color)" />
          Your Partner Code
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Share this unique code with your partner or friend so they can link their account to yours.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <code style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--accent-color)', letterSpacing: '1px' }}>
            {profile.uid}
          </code>
          <button className="btn btn-ghost" onClick={handleCopy} title="Copy Code" style={{ padding: '8px' }}>
            {copied ? <span style={{ color: 'var(--success-color)' }}>Copied!</span> : <Copy size={20} />}
          </button>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)' }} />

      {/* Connect Section */}
      {profile.partnerUid ? (
        <div style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--success-color)' }}>Connected!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            You are connected to partner: <code style={{ color: 'var(--text-primary)' }}>{profile.partnerUid.substring(0, 8)}...</code>
          </p>
          <button className="btn btn-ghost" onClick={handleDisconnect} style={{ color: 'var(--danger-color)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Link2Off size={18} /> Disconnect
          </button>
        </div>
      ) : (
        <div>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={24} color="var(--accent-color)" />
            Connect to Partner
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Enter your partner's code here to link your watchlists and find your best matches.
          </p>
          
          <form onSubmit={handleConnect} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Paste partner code..." 
              value={partnerCodeInput}
              onChange={(e) => setPartnerCodeInput(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !partnerCodeInput.trim()}>
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
