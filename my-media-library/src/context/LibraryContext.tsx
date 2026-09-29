import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Game, Movie, LibraryStats, UserProfile } from '../types';
import initialGames from '../data/games.json';
import initialMovies from '../data/movies.json';
import { isVerifiedOfficialUrl } from '../utils/imageResolver';

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

const GAMES_STORAGE_KEY = 'vault_shelf_games_v2';
const MOVIES_STORAGE_KEY = 'vault_shelf_movies_v2';


export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>(() => {
    try {
      const saved = localStorage.getItem(GAMES_STORAGE_KEY) || localStorage.getItem('vault_shelf_games_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Replace any legacy unsplash stock covers with official verified covers
          return parsed.map((item: Game) => {
            if (!isVerifiedOfficialUrl(item.cover)) {
              const defaultMatch = (initialGames as Game[]).find(
                (g) => g.name.toLowerCase() === item.name.toLowerCase()
              );
              if (defaultMatch) {
                return { ...item, cover: defaultMatch.cover };
              }
            }
            return item;
          });
        }
      }
    } catch {
      // fallback to initial
    }
    return initialGames as Game[];
  });

  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem(MOVIES_STORAGE_KEY) || localStorage.getItem('vault_shelf_movies_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Replace any legacy unsplash stock posters with official verified posters
          return parsed.map((item: Movie) => {
            if (!isVerifiedOfficialUrl(item.cover)) {
              const defaultMatch = (initialMovies as Movie[]).find(
                (m) => m.name.toLowerCase() === item.name.toLowerCase()
              );
              if (defaultMatch) {
                return { ...item, cover: defaultMatch.cover };
              }
            }
            return item;
          });
        }
      }
    } catch {
      // fallback to initial
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
          return { ...DEFAULT_PROFILE, ...parsed };
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
    setProfile((prev) => ({
      ...prev,
      ...changes
    }));
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
    setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const updateMovie = (updated: Movie) => {
    setMovies((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const addGame = (newGameData: Omit<Game, 'id'>) => {
    const newGame: Game = {
      ...newGameData,
      id: Date.now(),
    };
    setGames((prev) => [newGame, ...prev]);
  };

  const addMovie = (newMovieData: Omit<Movie, 'id'>) => {
    const newMovie: Movie = {
      ...newMovieData,
      id: Date.now(),
    };
    setMovies((prev) => [newMovie, ...prev]);
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
  };

  const importLibrary = (data: { games?: Game[]; movies?: Movie[]; profile?: UserProfile }): boolean => {
    if (!data || (!Array.isArray(data.games) && !Array.isArray(data.movies) && !data.profile)) {
      return false;
    }
    if (Array.isArray(data.games) && data.games.length > 0) {
      setGames(data.games);
    }
    if (Array.isArray(data.movies) && data.movies.length > 0) {
      setMovies(data.movies);
    }
    if (data.profile && data.profile.avatar) {
      setProfile(data.profile);
    }
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


