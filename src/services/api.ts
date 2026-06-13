const API_KEY = 'b2e0c068b7e6a5e301d5f3a20cd5d169';
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  overview: string;
  first_air_date: string;
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

// Returns US watch providers by default
export const getSeasonWatchProviders = async (showId: number, seasonNumber: number, countryCode: string = 'US'): Promise<WatchProvidersResponse | null> => {
  const response = await fetch(`${BASE_URL}/tv/${showId}/season/${seasonNumber}/watch/providers?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results?.[countryCode] || null;
};

export const getImageUrl = (path: string | null, size: 'w200' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
