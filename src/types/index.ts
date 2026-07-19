import type { ShowDetails, Season, WatchProvidersResponse, Movie } from '../services/api';

export interface WatchlistItem {
  id: string; // unique ID, e.g., showId-seasonId
  show: ShowDetails;
  season: Season;
  providers: WatchProvidersResponse | null;
  addedAt?: number;
  providersUpdatedAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  partnerUid: string | null;
  notInterested?: string[];
  lastVisitedAt?: number;
}

export interface WatchedItem extends WatchlistItem {
  liked: boolean | null;
  watchedAt: number;
}

export interface MovieWatchlistItem {
  id: string; // unique ID, e.g., movieId
  movie: Movie;
  providers: WatchProvidersResponse | null;
  addedAt?: number;
  providersUpdatedAt?: number;
}

export interface WatchedMovieItem extends MovieWatchlistItem {
  liked: boolean | null;
  watchedAt: number;
}
