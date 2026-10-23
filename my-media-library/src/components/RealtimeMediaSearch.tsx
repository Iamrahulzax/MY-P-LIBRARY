import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLibrary } from '../context/LibraryContext';
import {
  searchRealtimeMovies,
  searchRealtimeGames,
  type MovieSearchResult,
  type GameSearchResult
} from '../services/realtimeSearch';
import type { GameStatus, MovieStatus } from '../types';
import {
  Search,
  Plus,
  Check,
  Star,
  Film,
  Gamepad2,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
  User,
  Monitor
} from 'lucide-react';

interface Props {
  type: 'game' | 'movie';
  initialQuery?: string;
  onItemAdded?: (title: string) => void;
  onSelectForEdit?: (item: GameSearchResult | MovieSearchResult, type: 'game' | 'movie') => void;
  standalone?: boolean;
}

const TRENDING_MOVIES = [
  'Inception',
  'Interstellar',
  'Oppenheimer',
  'Dune: Part Two',
  'The Dark Knight',
  'Gladiator II',
  'Alien: Romulus',
  'Spider-Man',
  'Avatar',
  'The Godfather'
];

const TRENDING_GAMES = [
  'Elden Ring',
  'Cyberpunk 2077',
  'Black Myth: Wukong',
  "Baldur's Gate 3",
  'Zelda',
  'God of War Ragnarök',
  'Red Dead Redemption 2',
  'Hades II',
  'GTA V',
  'Minecraft'
];

export const RealtimeMediaSearch: React.FC<Props> = ({
  type,
  initialQuery = '',
  onItemAdded,
  onSelectForEdit,
  standalone = false
}) => {
  const { games, movies, addGame, addMovie } = useLibrary();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Array<GameSearchResult | MovieSearchResult>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Per-item status overrides before adding
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({});
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({});

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set of names already in local library
  const existingLibraryNames = useMemo(() => {
    if (type === 'game') {
      return new Set(games.map((g) => g.name.toLowerCase().trim()));
    }
    return new Set(movies.map((m) => m.name.toLowerCase().trim()));
  }, [type, games, movies]);

  // Execute search
  const performSearch = React.useCallback(async (searchTerm: string) => {
    setIsSearching(true);
    try {
      if (type === 'game') {
        const res = await searchRealtimeGames(searchTerm);
        setResults(res);
      } else {
        const res = await searchRealtimeMovies(searchTerm);
        setResults(res);
      }
    } catch (err) {
      console.error('Real-time search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [type]);

  // Debounced search on query change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, performSearch]);

  const handleAddToVault = (item: GameSearchResult | MovieSearchResult) => {
    const customRating = selectedRatings[item.id] ?? item.rating ?? 9;

    if (type === 'game') {
      const g = item as GameSearchResult;
      const status = (selectedStatuses[item.id] as GameStatus) || 'Playing';

      addGame({
        name: g.name,
        cover: g.cover,
        platform: g.platform || 'PC',
        genre: g.genre || 'Action RPG',
        releaseYear: g.releaseYear || new Date().getFullYear(),
        rating: customRating,
        status,
        hoursPlayed: status === 'Backlog' ? 0 : 5,
        datePlayed: status === 'Backlog' ? undefined : new Date().toISOString().split('T')[0],
        favorite: false,
        notes: g.overview ? g.overview.slice(0, 300) : '',
        review: '',
        tags: [g.genre.split('/')[0].trim(), 'Vault Addition']
      });
    } else {
      const m = item as MovieSearchResult;
      const status = (selectedStatuses[item.id] as MovieStatus) || 'Watched';

      addMovie({
        name: m.name,
        cover: m.cover,
        genre: m.genre || 'Drama / Cinema',
        director: m.director || 'Director',
        releaseYear: m.releaseYear || new Date().getFullYear(),
        rating: customRating,
        status,
        dateWatched: status === 'Watchlist' ? undefined : new Date().toISOString().split('T')[0],
        favorite: false,
        notes: m.overview ? m.overview.slice(0, 300) : '',
        review: '',
        tags: [m.genre.split('/')[0].trim(), 'Vault Addition']
      });
    }

    setAddedIds((prev) => new Set([...prev, item.id]));
    if (onItemAdded) {
      onItemAdded(item.name);
    }
  };

  const trendingTags = type === 'game' ? TRENDING_GAMES : TRENDING_MOVIES;

  return (
    <div className="realtime-search-container" style={{ width: '100%' }}>
      {/* Search Input Box */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
        <div style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: isSearching ? 'var(--primary-light)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            type === 'game'
              ? 'Real-time search games (e.g. Elden Ring, Black Myth, Cyberpunk, GTA)...'
              : 'Real-time search movies (e.g. Inception, Dune, Oppenheimer, Gladiator)...'
          }
          style={{
            width: '100%',
            padding: '14px 16px 14px 46px',
            fontSize: '15px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = type === 'game' ? 'var(--primary-light)' : '#c084fc';
            e.currentTarget.style.boxShadow = type === 'game'
              ? '0 0 0 3px rgba(99, 102, 241, 0.25)'
              : '0 0 0 3px rgba(192, 132, 252, 0.25)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.25)';
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Trending / Quick Suggestion Chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        <span style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: 600
        }}>
          <Sparkles size={14} color="#f59e0b" />
          <span>Popular:</span>
        </span>
        {trendingTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setQuery(tag)}
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 500,
              background: query.toLowerCase() === tag.toLowerCase()
                ? (type === 'game' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(192, 132, 252, 0.3)')
                : 'rgba(255, 255, 255, 0.05)',
              border: query.toLowerCase() === tag.toLowerCase()
                ? (type === 'game' ? '1px solid var(--primary-light)' : '1px solid #c084fc')
                : '1px solid rgba(255, 255, 255, 0.08)',
              color: query.toLowerCase() === tag.toLowerCase() ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Live Results Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {type === 'game' ? <Gamepad2 size={16} color="var(--primary-light)" /> : <Film size={16} color="#c084fc" />}
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {query ? `Real-Time Results for "${query}"` : 'Curated Titles Ready to Add'}
          </span>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'var(--text-muted)'
          }}>
            {results.length} found
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Live Online Data & 4K Cover Art
        </span>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: standalone ? 'repeat(auto-fill, minmax(290px, 1fr))' : 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
          maxHeight: standalone ? 'unset' : '480px',
          overflowY: standalone ? 'visible' : 'auto',
          paddingRight: standalone ? '0' : '4px'
        }}>
          {results.map((item) => {
            const isAlreadyInVault = existingLibraryNames.has(item.name.toLowerCase().trim());
            const isJustAdded = addedIds.has(item.id);
            const currentStatus = selectedStatuses[item.id] || (type === 'game' ? 'Playing' : 'Watched');
            const currentRating = selectedRatings[item.id] ?? item.rating ?? 9;

            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(18, 24, 38, 0.75)',
                  border: isJustAdded
                    ? '1px solid rgba(16, 185, 129, 0.5)'
                    : isAlreadyInVault
                    ? '1px solid rgba(99, 102, 241, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isJustAdded ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none'
                }}
              >
                {/* Media Preview Header */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: type === 'movie' ? '16 / 9' : '16 / 9',
                  overflow: 'hidden',
                  backgroundColor: '#0c1017'
                }}>
                  <img
                    src={item.cover}
                    alt={item.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center 20%'
                    }}
                    onError={(e) => {
                      // Fallback placeholder image
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(12, 16, 23, 0.95) 0%, rgba(12, 16, 23, 0.2) 60%, transparent 100%)'
                  }} />

                  {/* Top Badges */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(8px)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fbbf24'
                    }}>
                      <Star size={11} fill="#fbbf24" />
                      {currentRating}/10
                    </span>

                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.source === 'steam'
                        ? 'rgba(23, 26, 38, 0.9)'
                        : item.source === 'tmdb'
                        ? 'rgba(3, 37, 65, 0.9)'
                        : 'rgba(99, 102, 241, 0.3)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {item.source}
                    </span>
                  </div>

                  {/* Release Year badge bottom left of image */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)'
                  }}>
                    <Calendar size={12} />
                    <span>{item.releaseYear}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#fff',
                      margin: '0 0 6px 0',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }} title={item.name}>
                      {item.name}
                    </h4>

                    {/* Metadata line */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {type === 'game' ? (
                        <>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Monitor size={11} />
                            {(item as GameSearchResult).platform || 'PC'}
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Layers size={11} />
                            {item.genre.split('/')[0]}
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <User size={11} />
                            {(item as MovieSearchResult).director || 'Director'}
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Layers size={11} />
                            {item.genre.split('/')[0]}
                          </span>
                        </>
                      )}
                    </div>

                    {item.overview && (
                      <p style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        margin: '0 0 12px 0',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.overview}
                      </p>
                    )}
                  </div>

                  {/* Actions & Status Control */}
                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      {/* Status Selector */}
                      <select
                        value={currentStatus}
                        onChange={(e) => setSelectedStatuses((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {type === 'game' ? (
                          <>
                            <option value="Playing">Status: Playing</option>
                            <option value="Completed">Status: Completed</option>
                            <option value="Backlog">Status: Backlog</option>
                            <option value="On Hold">Status: On Hold</option>
                            <option value="Dropped">Status: Dropped</option>
                            <option value="Replaying">Status: Replaying</option>
                          </>
                        ) : (
                          <>
                            <option value="Watched">Status: Watched</option>
                            <option value="Watchlist">Status: Watchlist</option>
                            <option value="Favorite">Status: Favorite</option>
                            <option value="Rewatch">Status: Rewatch</option>
                          </>
                        )}
                      </select>

                      {/* Quick Rating Selector */}
                      <select
                        value={currentRating}
                        onChange={(e) => setSelectedRatings((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                        style={{
                          width: '78px',
                          padding: '6px 4px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#fbbf24',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n} ⭐</option>
                        ))}
                      </select>
                    </div>

                    {/* Add Button */}
                    {isJustAdded ? (
                      <button
                        type="button"
                        disabled
                        style={{
                          width: '100%',
                          padding: '9px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          background: 'rgba(16, 185, 129, 0.25)',
                          border: '1px solid #10b981',
                          color: '#34d399',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'default'
                        }}
                      >
                        <Check size={16} />
                        <span>Added to Vault!</span>
                      </button>
                    ) : isAlreadyInVault ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleAddToVault(item)}
                          style={{
                            flex: 1,
                            padding: '9px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                          }}
                          title="Already in your library - click to update or add duplicate entry"
                        >
                          <Check size={14} />
                          <span>In Vault (Add Again)</span>
                        </button>
                        {onSelectForEdit && (
                          <button
                            type="button"
                            onClick={() => onSelectForEdit(item, type)}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                            title="Edit notes & customize"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleAddToVault(item)}
                          style={{
                            flex: 1,
                            padding: '9px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            background: type === 'game'
                              ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                              : 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                            border: 'none',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            boxShadow: type === 'game'
                              ? '0 4px 12px rgba(99, 102, 241, 0.3)'
                              : '0 4px 12px rgba(168, 85, 247, 0.3)'
                          }}
                        >
                          <Plus size={16} />
                          <span>Add to Vault</span>
                        </button>

                        {onSelectForEdit && (
                          <button
                            type="button"
                            onClick={() => onSelectForEdit(item, type)}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                            title="Customize review & notes first"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 12px 0' }}>
            No real-time results found matching &quot;{query}&quot;.
          </p>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Try a different title keyword or click &quot;Manual Entry&quot; above to add custom entry details!
          </span>
        </div>
      )}
    </div>
  );
};

export default RealtimeMediaSearch;
