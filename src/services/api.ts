const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  overview: string;
  first_air_date: string;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episode_count: number;
}

export interface ShowDetails extends TVShow {
  seasons: Season[];
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProvidersResponse {
  link: string;
  flatrate?: WatchProvider[];
  buy?: WatchProvider[];
  rent?: WatchProvider[];
  free?: WatchProvider[];
}

const cleanProviderName = (name: string): string => {
  return name
    .replace(/ (Standard|Basic|Premium)? ?with Ads/i, '')
    .replace(/ (Amazon|Roku Premium|Apple TV) Channel/i, '')
    .replace(/ Plus/ig, '+')
    .trim();
};

const deduplicateProvidersList = (providers: WatchProvider[] | undefined): WatchProvider[] | undefined => {
  if (!providers || providers.length === 0) return providers;
  
  const deduplicated: WatchProvider[] = [];
  
  const EXCLUDED_PROVIDERS = ['youtube tv', 'fubotv', 'sling tv', 'directv', 'philo', 'spectrum on demand'];

  // Sort by length so we prefer the shorter "base" name if both exist
  const sorted = [...providers].sort((a, b) => a.provider_name.length - b.provider_name.length);
  
  for (const provider of sorted) {
    const cleanName = cleanProviderName(provider.provider_name).toLowerCase();
    
    // Skip MVPDs / live TV providers
    if (EXCLUDED_PROVIDERS.some(ex => cleanName.includes(ex))) {
      continue;
    }
    
    // Check if we already have a provider that is a prefix of this one
    // (e.g., if we have "peacock premium", we skip "peacock premium plus")
    const isDuplicate = deduplicated.some(existing => 
      cleanName.startsWith(existing.provider_name.toLowerCase())
    );
    
    if (!isDuplicate) {
      // Keep the original case for display, but use the cleaned string (which removes the "with Ads" etc.)
      deduplicated.push({ ...provider, provider_name: cleanProviderName(provider.provider_name) });
    }
  }
  
  return deduplicated;
};

export const deduplicateResponse = (response: WatchProvidersResponse | null): WatchProvidersResponse | null => {
  if (!response) return response;
  return {
    ...response,
    flatrate: deduplicateProvidersList(response.flatrate),
    buy: deduplicateProvidersList(response.buy),
    rent: deduplicateProvidersList(response.rent),
    free: deduplicateProvidersList(response.free),
  };
};

export const searchTVShows = async (query: string): Promise<TVShow[]> => {
  if (!query) return [];
  const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.results || [];
};

export const getShowDetails = async (showId: number): Promise<ShowDetails> => {
  const response = await fetch(`${BASE_URL}/tv/${showId}?api_key=${API_KEY}`);
  const data = await response.json();
  return data;
};

export const getShowWatchProviders = async (showId: number, countryCode: string = 'US'): Promise<WatchProvidersResponse | null> => {
  const response = await fetch(`${BASE_URL}/tv/${showId}/watch/providers?api_key=${API_KEY}`);
  const data = await response.json();
  return deduplicateResponse(data.results?.[countryCode] || null);
};

// Returns US watch providers by default
export const getSeasonWatchProviders = async (showId: number, seasonNumber: number, countryCode: string = 'US'): Promise<WatchProvidersResponse | null> => {
  const response = await fetch(`${BASE_URL}/tv/${showId}/season/${seasonNumber}/watch/providers?api_key=${API_KEY}`);
  const data = await response.json();
  return deduplicateResponse(data.results?.[countryCode] || null);
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query) return [];
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.results || [];
};

export const getMovieWatchProviders = async (movieId: number, countryCode: string = 'US'): Promise<WatchProvidersResponse | null> => {
  const response = await fetch(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
  const data = await response.json();
  return deduplicateResponse(data.results?.[countryCode] || null);
};

export const getImageUrl = (path: string | null, size: 'w200' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
