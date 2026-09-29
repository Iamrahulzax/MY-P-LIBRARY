export type GameStatus =
  | 'Playing'
  | 'Completed'
  | 'On Hold'
  | 'Dropped'
  | 'Backlog'
  | 'Replaying';

export type MovieStatus =
  | 'Watched'
  | 'Watchlist'
  | 'Favorite'
  | 'Rewatch';

export interface Game {
  id: string | number;
  name: string;
  cover: string;
  platform: string;
  genre: string;
  releaseYear: number;
  rating: number; // 1 to 10
  status: GameStatus;
  hoursPlayed: number;
  datePlayed?: string; // e.g. "2026-03-12" or "2026"
  favorite: boolean;
  notes?: string;
  review?: string;
  tags?: string[];
}

export interface Movie {
  id: string | number;
  name: string;
  cover: string;
  genre: string;
  director?: string;
  releaseYear: number;
  rating: number; // 1 to 10
  status: MovieStatus;
  dateWatched?: string;
  favorite: boolean;
  notes?: string;
  review?: string;
  tags?: string[];
}

export interface UserProfile {
  name: string;
  avatar: string;
  tagline: string;
  favoriteGenre?: string;
}

export interface LibraryStats {
  totalGames: number;
  totalMovies: number;
  totalHoursPlayed: number;
  favoritesCount: number;
  completedGames: number;
  backlogCount: number;
  watchlistCount: number;
  avgGameRating: number;
  avgMovieRating: number;
}

