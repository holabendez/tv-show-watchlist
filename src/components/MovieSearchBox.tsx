import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { searchMovies, getImageUrl } from '../services/api';
import type { Movie } from '../services/api';

interface MovieSearchBoxProps {
  onSelectMovie: (movie: Movie) => void;
}

export const MovieSearchBox: React.FC<MovieSearchBoxProps> = ({ onSelectMovie }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        const data = await searchMovies(query);
        setResults(data);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="search-box" style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Search for a Movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
      </div>
      
      {results.length > 0 && (
        <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', zIndex: 10, maxHeight: '400px', overflowY: 'auto' }}>
          {results.map((movie) => (
            <div 
              key={movie.id} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', borderBottom: '1px solid var(--border-glass)' }}
              onClick={() => {
                onSelectMovie(movie);
                setQuery('');
                setResults([]);
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <img 
                src={getImageUrl(movie.poster_path, 'w200')} 
                alt={movie.title} 
                style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
              />
              <div>
                <h4 style={{ margin: 0 }}>{movie.title}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {movie.release_date ? movie.release_date.substring(0, 4) : 'Unknown'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
