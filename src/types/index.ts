import type { ShowDetails, Season, WatchProvidersResponse } from '../services/api';

export interface WatchlistItem {
  id: string; // unique ID, e.g., showId-seasonId
  show: ShowDetails;
  season: Season;
  providers: WatchProvidersResponse | null;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  partnerUid: string | null;
}

export interface WatchedItem extends WatchlistItem {
  liked: boolean | null;
  watchedAt: number;
}
