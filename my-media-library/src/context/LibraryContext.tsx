import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Game, Movie, LibraryStats, UserProfile } from '../types';
import initialGames from '../data/games.json';
import initialMovies from '../data/movies.json';
import { isVerifiedOfficialUrl } from '../utils/imageResolver';
import {
  sanitizeInput,
  sanitizeUrl,
  sanitizeNumber,
  preventPrototypePollution,
  recordSecurityAudit
} from '../utils/security';

export interface AvatarOption {
  id: string;
  name: string;
  url: string;
  tag: string;
  description: string;
}

export const PRESET_AVATARS: AvatarOption[] = [
  {
    id: 'cat-dev',
    name: 'Senior Coder Cat',
    url: '/avatars/cat-dev.jpg',
    tag: '🌟 Featured',
    description: 'Cat engineer with ID badge debugging hard code'
  },
  {
    id: 'cyber-samurai',
    name: 'Cyber Samurai',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80',
    tag: 'Gaming',
    description: 'Neon warrior of futuristic dystopias'
  },
  {
    id: 'pixel-knight',
    name: 'Pixel Knight',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    tag: 'RPG',
    description: 'Master of 100+ high-difficulty questlines'
  },
  {
    id: 'cinephile-director',
    name: 'Cinephile Director',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    tag: 'Cinema',
    description: 'Purist cinephile obsessed with IMAX 70mm'
  },
  {
    id: 'retro-ace',
    name: 'Retro Ace',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    tag: 'Arcade',
    description: 'Retro game collector and speedrun master'
  },
  {
    id: 'cosmic-voyager',
    name: 'Cosmic Voyager',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    tag: 'Sci-Fi',
    description: 'Space-time traveler charting unseen galaxies'
  }
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Rahul',
  avatar: '/avatars/cat-dev.jpg',
  tagline: 'Senior Gamer & Cinephile Dev',
  favoriteGenre: 'Sci-Fi / RPG'
};

const PROFILE_STORAGE_KEY = 'vault_shelf_profile_v2';
const GAMES_STORAGE_KEY = 'vault_shelf_games_v2';
const MOVIES_STORAGE_KEY = 'vault_shelf_movies_v2';

function sanitizeGameItem(g: Partial<Game>): Game {
  const allowedStatuses = ['Playing', 'Completed', 'Backlog', 'Abandoned'];
  const status = allowedStatuses.includes(g.status as string) ? (g.status as Game['status']) : 'Playing';

  return {
    id: g.id || Date.now(),
    name: sanitizeInput(g.name, 120) || 'Untitled Game',
    cover: sanitizeUrl(g.cover) || '',
    platform: sanitizeInput(g.platform, 60) || 'PC',
    genre: sanitizeInput(g.genre, 60) || 'Action',
    releaseYear: sanitizeNumber(g.releaseYear, 1970, 2100, new Date().getFullYear()),
    rating: sanitizeNumber(g.rating, 0, 10, 8),
    status,
    hoursPlayed: sanitizeNumber(g.hoursPlayed, 0, 100000, 0),
    datePlayed: g.datePlayed ? sanitizeInput(g.datePlayed, 30) : undefined,
    favorite: Boolean(g.favorite),
    notes: sanitizeInput(g.notes, 1000, true),
    review: sanitizeInput(g.review, 2000, true),
    tags: Array.isArray(g.tags) ? g.tags.map((t) => sanitizeInput(t, 40)).filter(Boolean) : []
  };
}

function sanitizeMovieItem(m: Partial<Movie>): Movie {
  const allowedStatuses = ['Watched', 'Watchlist', 'Rewatching'];
  const status = allowedStatuses.includes(m.status as string) ? (m.status as Movie['status']) : 'Watched';

  return {
    id: m.id || Date.now(),
    name: sanitizeInput(m.name, 120) || 'Untitled Movie',
    cover: sanitizeUrl(m.cover) || '',
    genre: sanitizeInput(m.genre, 60) || 'Drama',
    director: sanitizeInput(m.director, 100) || 'Director',
    releaseYear: sanitizeNumber(m.releaseYear, 1890, 2100, new Date().getFullYear()),
    rating: sanitizeNumber(m.rating, 0, 10, 8),
    status,
    dateWatched: m.dateWatched ? sanitizeInput(m.dateWatched, 30) : undefined,
    favorite: Boolean(m.favorite),
    notes: sanitizeInput(m.notes, 1000, true),
    review: sanitizeInput(m.review, 2000, true),
    tags: Array.isArray(m.tags) ? m.tags.map((t) => sanitizeInput(t, 40)).filter(Boolean) : []
  };
}

function sanitizeProfile(p: Partial<UserProfile>): UserProfile {
  return {
    name: sanitizeInput(p.name, 50) || DEFAULT_PROFILE.name,
    avatar: sanitizeUrl(p.avatar) || DEFAULT_PROFILE.avatar,
    tagline: sanitizeInput(p.tagline, 100) || DEFAULT_PROFILE.tagline,
    favoriteGenre: sanitizeInput(p.favoriteGenre, 60) || DEFAULT_PROFILE.favoriteGenre
  };
}

interface LibraryContextType {
  games: Game[];
  movies: Movie[];
  stats: LibraryStats;
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
  toggleGameFavorite: (id: string | number) => void;
  toggleMovieFavorite: (id: string | number) => void;
  updateGame: (game: Game) => void;
  updateMovie: (movie: Movie) => void;
  addGame: (game: Omit<Game, 'id'>) => void;
  addMovie: (movie: Omit<Movie, 'id'>) => void;
  deleteGame: (id: string | number) => void;
  deleteMovie: (id: string | number) => void;
  resetToDefault: () => void;
  importLibrary: (data: { games?: Game[]; movies?: Movie[]; profile?: UserProfile }) => boolean;
  exportLibrary: () => { games: Game[]; movies: Movie[]; profile: UserProfile; exportedAt: string };
}

export const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>(() => {
    try {
      const saved = localStorage.getItem(GAMES_STORAGE_KEY) || localStorage.getItem('vault_shelf_games_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitizedList = parsed.map((item: Game) => {
            const clean = sanitizeGameItem(item);
            if (!isVerifiedOfficialUrl(clean.cover)) {
              const defaultMatch = (initialGames as Game[]).find(
                (g) => g.name.toLowerCase() === clean.name.toLowerCase()
              );
              if (defaultMatch) {
                return { ...clean, cover: defaultMatch.cover };
              }
            }
            return clean;
          });

          const existingNames = new Set(sanitizedList.map((g: Game) => g.name.toLowerCase()));
          const missingDefaults = (initialGames as Game[]).filter(
            (g) => !existingNames.has(g.name.toLowerCase())
          );
          return [...sanitizedList, ...missingDefaults];
        }
      }
    } catch {
      // fallback
    }
    return initialGames as Game[];
  });

  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem(MOVIES_STORAGE_KEY) || localStorage.getItem('vault_shelf_movies_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitizedList = parsed.map((item: Movie) => {
            const clean = sanitizeMovieItem(item);
            if (!isVerifiedOfficialUrl(clean.cover)) {
              const defaultMatch = (initialMovies as Movie[]).find(
                (m) => m.name.toLowerCase() === clean.name.toLowerCase()
              );
              if (defaultMatch) {
                return { ...clean, cover: defaultMatch.cover };
              }
            }
            return clean;
          });

          const existingNames = new Set(sanitizedList.map((m: Movie) => m.name.toLowerCase()));
          const missingDefaults = (initialMovies as Movie[]).filter(
            (m) => !existingNames.has(m.name.toLowerCase())
          );
          return [...sanitizedList, ...missingDefaults];
        }
      }
    } catch {
      // fallback
    }
    return initialMovies as Movie[];
  });

  useEffect(() => {
    try {
      localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
    } catch (e) {
      console.error('Failed to save games to localStorage', e);
    }
  }, [games]);

  useEffect(() => {
    try {
      localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(movies));
    } catch (e) {
      console.error('Failed to save movies to localStorage', e);
    }
  }, [movies]);

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY) || localStorage.getItem('vault_shelf_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.avatar) {
          return sanitizeProfile({ ...DEFAULT_PROFILE, ...parsed });
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  }, [profile]);

  const updateProfile = (changes: Partial<UserProfile>) => {
    setProfile((prev) => sanitizeProfile({ ...prev, ...changes }));
  };

  const toggleGameFavorite = (id: string | number) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g))
    );
  };

  const toggleMovieFavorite = (id: string | number) => {
    setMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, favorite: !m.favorite } : m))
    );
  };

  const updateGame = (updated: Game) => {
    const clean = sanitizeGameItem(updated);
    setGames((prev) => prev.map((g) => (g.id === clean.id ? clean : g)));
  };

  const updateMovie = (updated: Movie) => {
    const clean = sanitizeMovieItem(updated);
    setMovies((prev) => prev.map((m) => (m.id === clean.id ? clean : m)));
  };

  const addGame = (newGameData: Omit<Game, 'id'>) => {
    const clean = sanitizeGameItem({
      ...newGameData,
      id: Date.now()
    });
    setGames((prev) => [clean, ...prev]);
  };

  const addMovie = (newMovieData: Omit<Movie, 'id'>) => {
    const clean = sanitizeMovieItem({
      ...newMovieData,
      id: Date.now()
    });
    setMovies((prev) => [clean, ...prev]);
  };

  const deleteGame = (id: string | number) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  const deleteMovie = (id: string | number) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  const resetToDefault = () => {
    setGames(initialGames as Game[]);
    setMovies(initialMovies as Movie[]);
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem(GAMES_STORAGE_KEY);
    localStorage.removeItem(MOVIES_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem('vault_shelf_games_v1');
    localStorage.removeItem('vault_shelf_movies_v1');
    localStorage.removeItem('media_poster_cache_v1');
    recordSecurityAudit('DATA_RESET', 'Factory reset performed on media database', 'medium');
  };

  const importLibrary = (data: { games?: Game[]; movies?: Movie[]; profile?: UserProfile }): boolean => {
    if (!data || (!Array.isArray(data.games) && !Array.isArray(data.movies) && !data.profile)) {
      return false;
    }
    const safeData = preventPrototypePollution(data);
    if (Array.isArray(safeData.games) && safeData.games.length > 0) {
      const sanitizedGames = safeData.games.map((g) => sanitizeGameItem(g));
      setGames(sanitizedGames);
    }
    if (Array.isArray(safeData.movies) && safeData.movies.length > 0) {
      const sanitizedMovies = safeData.movies.map((m) => sanitizeMovieItem(m));
      setMovies(sanitizedMovies);
    }
    if (safeData.profile && safeData.profile.avatar) {
      setProfile(sanitizeProfile(safeData.profile));
    }
    recordSecurityAudit('DATA_IMPORT', 'Media library imported with prototype pollution protection');
    return true;
  };

  const exportLibrary = () => {
    return {
      games,
      movies,
      profile,
      exportedAt: new Date().toISOString()
    };
  };

  // Compute live statistics
  const totalGames = games.length;
  const totalMovies = movies.length;
  const totalHoursPlayed = games.reduce((acc, g) => acc + (Number(g.hoursPlayed) || 0), 0);
  const completedGames = games.filter((g) => g.status === 'Completed').length;
  const backlogCount = games.filter((g) => g.status === 'Backlog').length;
  const watchlistCount = movies.filter((m) => m.status === 'Watchlist').length;
  const favGames = games.filter((g) => g.favorite).length;
  const favMovies = movies.filter((m) => m.favorite).length;
  const favoritesCount = favGames + favMovies;

  const avgGameRating = totalGames > 0
    ? Number((games.reduce((acc, g) => acc + (Number(g.rating) || 0), 0) / totalGames).toFixed(1))
    : 0;

  const avgMovieRating = totalMovies > 0
    ? Number((movies.reduce((acc, m) => acc + (Number(m.rating) || 0), 0) / totalMovies).toFixed(1))
    : 0;

  const stats: LibraryStats = {
    totalGames,
    totalMovies,
    totalHoursPlayed,
    favoritesCount,
    completedGames,
    backlogCount,
    watchlistCount,
    avgGameRating,
    avgMovieRating,
  };

  return (
    <LibraryContext.Provider
      value={{
        games,
        movies,
        stats,
        profile,
        updateProfile,
        toggleGameFavorite,
        toggleMovieFavorite,
        updateGame,
        updateMovie,
        addGame,
        addMovie,
        deleteGame,
        deleteMovie,
        resetToDefault,
        importLibrary,
        exportLibrary,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
