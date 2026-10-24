import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Movie, MovieStatus } from '../types';
import MovieCard from '../components/MovieCard';
import DetailModal from '../components/DetailModal';
import FilterBar from '../components/FilterBar';
import AddItemModal from '../components/AddItemModal';
import RealtimeMediaSearch from '../components/RealtimeMediaSearch';
import { searchRealtimeMovies, type MovieSearchResult } from '../services/realtimeSearch';
import {
  Film,
  Plus,
  Bookmark,
  Search,
  Sparkles,
  Check,
  Loader2,
  Star,
  Calendar,
  User,
  Layers,
  CheckCircle2
} from 'lucide-react';

const Movies: React.FC = () => {
  const { movies, addMovie } = useLibrary();

  // Mode: 'vault' (saved collection) or 'realtime' (live search & add)
  const [viewMode, setViewMode] = useState<'vault' | 'realtime'>('vault');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genreFilter, setGenreFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [isFavoriteOnly, setIsFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating-desc');

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Live real-time discovery state
  const [liveResults, setLiveResults] = useState<MovieSearchResult[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [quickStatuses, setQuickStatuses] = useState<Record<string, MovieStatus>>({});
  const [quickRatings, setQuickRatings] = useState<Record<string, number>>({});
  const [addedQuickIds, setAddedQuickIds] = useState<Set<string>>(new Set());
  const [recentlyAddedNotification, setRecentlyAddedNotification] = useState<string | null>(null);
  const liveSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract unique genres
  const genreOptions = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      m.genre.split('/').forEach((part) => set.add(part.trim()));
    });
    return Array.from(set).sort();
  }, [movies]);

  // Status options with counts
  const statusOptions = useMemo(() => {
    const counts: Record<string, number> = {
      Watched: 0,
      Watchlist: 0,
      Favorite: 0,
      Rewatch: 0,
    };

    movies.forEach((m) => {
      if (counts[m.status] !== undefined) {
        counts[m.status]++;
      }
    });

    return [
      { label: 'All Movies', value: 'ALL', count: movies.length },
      { label: 'Watched', value: 'Watched', count: counts.Watched, color: '#10b981' },
      { label: 'Watchlist', value: 'Watchlist', count: counts.Watchlist, color: '#2563eb' },
      { label: 'Favorite', value: 'Favorite', count: counts.Favorite, color: '#f43f5e' },
      { label: 'Rewatch', value: 'Rewatch', count: counts.Rewatch, color: '#0284c7' },
    ];
  }, [movies]);

  const sortOptions = [
    { label: 'Highest Rating', value: 'rating-desc' },
    { label: 'Newest Release', value: 'year-desc' },
    { label: 'Title (A - Z)', value: 'title-asc' },
  ];

  // Filtering and Sorting
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = movie.name.toLowerCase().includes(q);
        const matchesGenre = movie.genre.toLowerCase().includes(q);
        const matchesDirector = movie.director ? movie.director.toLowerCase().includes(q) : false;
        const matchesYear = String(movie.releaseYear).includes(q);
        if (!matchesName && !matchesGenre && !matchesDirector && !matchesYear) {
          return false;
        }
      }

      // Status match
      if (statusFilter !== 'ALL' && movie.status !== statusFilter) {
        return false;
      }

      // Genre match
      if (genreFilter !== 'ALL' && !movie.genre.toLowerCase().includes(genreFilter.toLowerCase())) {
        return false;
      }

      // Favorite match
      if (isFavoriteOnly && !movie.favorite) {
        return false;
      }

      // Rating match
      if (ratingFilter !== 'ALL') {
        const minRating = Number(ratingFilter);
        if (movie.rating < minRating) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'year-desc') return b.releaseYear - a.releaseYear;
      if (sortBy === 'title-asc') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [movies, searchQuery, statusFilter, genreFilter, ratingFilter, isFavoriteOnly, sortBy]);

  // Debounced live real-time movie search as user types
  useEffect(() => {
    if (liveSearchDebounceRef.current) {
      clearTimeout(liveSearchDebounceRef.current);
    }

    const q = searchQuery.trim();
    if (q.length < 2) {
      setLiveResults([]);
      setIsLiveSearching(false);
      return;
    }

    setIsLiveSearching(true);
    liveSearchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await searchRealtimeMovies(q);
        setLiveResults(res);
      } catch (err) {
        console.error('Real-time cinema discovery error:', err);
      } finally {
        setIsLiveSearching(false);
      }
    }, 280);

    return () => {
      if (liveSearchDebounceRef.current) {
        clearTimeout(liveSearchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleQuickAddMovie = (item: MovieSearchResult) => {
    const status = quickStatuses[item.id] || 'Watched';
    const customRating = quickRatings[item.id] ?? item.rating ?? 9;

    addMovie({
      name: item.name,
      cover: item.cover,
      genre: item.genre || 'Cinema / Film',
      director: item.director || 'Director',
      releaseYear: item.releaseYear || new Date().getFullYear(),
      rating: customRating,
      status,
      dateWatched: status === 'Watchlist' ? undefined : new Date().toISOString().split('T')[0],
      favorite: false,
      notes: item.overview ? item.overview.slice(0, 300) : '',
      review: '',
      tags: [item.genre.split('/')[0].trim(), 'Vault Addition']
    });

    setAddedQuickIds((prev) => new Set([...prev, item.id]));
    setRecentlyAddedNotification(`Added "${item.name}" to your Cinema Vault! Catalog updated immediately.`);

    setTimeout(() => {
      setRecentlyAddedNotification(null);
    }, 5000);
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || genreFilter !== 'ALL' || ratingFilter !== 'ALL' || isFavoriteOnly;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setGenreFilter('ALL');
    setRatingFilter('ALL');
    setIsFavoriteOnly(false);
  };

  const watchlistCount = movies.filter((m) => m.status === 'Watchlist').length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Film size={36} color="#f5f5f5" />
            <span>Movie Collection</span>
          </h1>
          <p className="page-subtitle">
            Personal archive of every film seen, directors, reviews, and <span className="highlight">real-time cinema search</span>.
          </p>
        </div>

        <div className="page-stats-summary">
          <div className="stat-chip">
            <Film size={16} color="#f5f5f5" />
            <span>Total Movies:</span>
            <strong>{movies.length}</strong>
          </div>
          <div className="stat-chip">
            <Bookmark size={16} color="#34d399" />
            <span>Watchlist:</span>
            <strong>{watchlistCount}</strong>
          </div>

          <button
            type="button"
            className="btn-add-item"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)'
            }}
          >
            <Plus size={16} />
            <span>Add Movie</span>
          </button>
        </div>
      </div>

      {/* Main Mode Toggle: In Vault vs Real-Time Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setViewMode('vault')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              background: viewMode === 'vault' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              border: viewMode === 'vault' ? '1px solid #c084fc' : '1px solid transparent',
              color: viewMode === 'vault' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Film size={16} color={viewMode === 'vault' ? '#c084fc' : undefined} />
            <span>My Cinema Vault ({movies.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('realtime')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              background: viewMode === 'realtime' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              border: viewMode === 'realtime' ? '1px solid #c084fc' : '1px solid transparent',
              color: viewMode === 'realtime' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={16} color={viewMode === 'realtime' ? '#c084fc' : undefined} />
            <span>Real-Time Online Search & Add</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#a855f7',
              color: '#fff',
              textTransform: 'uppercase'
            }}>
              Live
            </span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
          <Sparkles size={14} color="#f59e0b" />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Search any movie globally to add straight to your Vault
          </span>
        </div>
      </div>

      {/* Dynamic Catalog Update Alert Banner */}
      {recentlyAddedNotification && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          marginBottom: '20px',
          borderRadius: '10px',
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          color: '#34d399',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle2 size={18} color="#34d399" />
            <span>{recentlyAddedNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setRecentlyAddedNotification(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#34d399',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {viewMode === 'realtime' ? (
        /* REAL-TIME ONLINE SEARCH MODE */
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '30px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={20} color="#c084fc" />
              <span>Real-Time Cinema Discovery</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Search OMDB, Wikipedia, TMDB, TVMaze, and verified theatrical archives with real-time posters, directors, and instant 1-click &quot;Add to Vault&quot;.
            </p>
          </div>

          <RealtimeMediaSearch
            type="movie"
            initialQuery={searchQuery}
            standalone={true}
            onSwitchToVault={() => setViewMode('vault')}
          />
        </div>
      ) : (
        /* VAULT MODE */
        <>
          {/* Filter & Controls */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={statusOptions}
            genreFilter={genreFilter}
            onGenreChange={setGenreFilter}
            genreOptions={genreOptions}
            ratingFilter={ratingFilter}
            onRatingChange={setRatingFilter}
            isFavoriteOnly={isFavoriteOnly}
            onFavoriteToggle={() => setIsFavoriteOnly(!isFavoriteOnly)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOptions={sortOptions}
            placeholder="Search movies by title, director, genre, year (live global search included)..."
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />

          {/* When actively searching, show organized sections for Vault + Real-Time Online Discovery */}
          {searchQuery.trim().length > 1 ? (
            <div>
              {/* Vault Matches Section */}
              {filteredMovies.length > 0 ? (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Film size={18} color="#c084fc" />
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                        In Your Personal Vault ({filteredMovies.length})
                      </h3>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Already cataloged on your shelf
                    </span>
                  </div>
                  <div className="movies-grid">
                    {filteredMovies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onSelect={setSelectedMovie} />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed rgba(255, 255, 255, 0.12)',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Search size={18} color="#c084fc" />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      &quot;<strong>{searchQuery}</strong>&quot; is not currently in your personal vault. Real-time global discoveries are loaded below:
                    </span>
                  </div>
                  {hasActiveFilters && (
                    <button type="button" className="btn-secondary" onClick={clearFilters} style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {/* Real-Time Live Online Cinema Discovery Results Section */}
              <div style={{
                marginTop: '10px',
                padding: '24px',
                borderRadius: '16px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(192, 132, 252, 0.25)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} color="#fbbf24" />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                      Real-Time Cinema Discovery for &quot;{searchQuery}&quot;
                    </h3>
                    {isLiveSearching ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#c084fc', fontWeight: 600 }}>
                        <Loader2 size={13} className="animate-spin" /> Searching global archives...
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: 'rgba(192, 132, 252, 0.2)',
                        color: '#c084fc',
                        fontWeight: 700
                      }}>
                        {liveResults.length} Live Results
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Live Theatrical Posters &bull; 1-Click &quot;+ Add to Vault&quot;
                  </span>
                </div>

                {liveResults.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '16px'
                  }}>
                    {liveResults.map((item) => {
                      const isAlreadyInVault = movies.some((m) => m.name.toLowerCase() === item.name.toLowerCase());
                      const isJustAdded = addedQuickIds.has(item.id);
                      const currentStatus = quickStatuses[item.id] || 'Watched';
                      const currentRating = quickRatings[item.id] ?? item.rating ?? 9;

                      return (
                        <div
                          key={item.id}
                          style={{
                            background: 'rgba(18, 24, 38, 0.85)',
                            border: isJustAdded
                              ? '1px solid #10b981'
                              : isAlreadyInVault
                              ? '1px solid rgba(192, 132, 252, 0.4)'
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.2s ease',
                            boxShadow: isJustAdded ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none'
                          }}
                        >
                          {/* Poster Header */}
                          <div style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '16 / 9',
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
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(to top, rgba(12, 16, 23, 0.95) 0%, rgba(12, 16, 23, 0.2) 60%, transparent 100%)'
                            }} />

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
                                background: 'rgba(168, 85, 247, 0.25)',
                                color: '#c084fc',
                                border: '1px solid rgba(192, 132, 252, 0.3)'
                              }}>
                                {item.source}
                              </span>
                            </div>

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

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                marginBottom: '8px',
                                flexWrap: 'wrap'
                              }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <User size={11} />
                                  {item.director || 'Director'}
                                </span>
                                <span>&bull;</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Layers size={11} />
                                  {item.genre.split('/')[0]}
                                </span>
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

                            {/* Status Selector & Add to Vault Action */}
                            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                <select
                                  value={currentStatus}
                                  onChange={(e) => setQuickStatuses((prev) => ({ ...prev, [item.id]: e.target.value as MovieStatus }))}
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
                                  <option value="Watched">Status: Watched</option>
                                  <option value="Watchlist">Status: Watchlist</option>
                                  <option value="Favorite">Status: Favorite</option>
                                  <option value="Rewatch">Status: Rewatch</option>
                                </select>

                                <select
                                  value={currentRating}
                                  onChange={(e) => setQuickRatings((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
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

                              {isJustAdded ? (
                                <button
                                  type="button"
                                  disabled
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
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
                                  <Check size={15} />
                                  <span>Added to Vault!</span>
                                </button>
                              ) : isAlreadyInVault ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickAddMovie(item)}
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    background: 'rgba(192, 132, 252, 0.15)',
                                    border: '1px solid rgba(192, 132, 252, 0.3)',
                                    color: '#c084fc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Check size={14} />
                                  <span>In Vault (Add Duplicate)</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleQuickAddMovie(item)}
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                                    border: 'none',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                                  }}
                                >
                                  <Plus size={15} />
                                  <span>Add to Vault</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : !isLiveSearching ? (
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                    No real-time online matches found for &quot;{searchQuery}&quot;. Try another title or use the &quot;+ Add Movie&quot; manual button above.
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            /* Normal Vault View (when not typing a search query) */
            <>
              {filteredMovies.length > 0 ? (
                <div className="movies-grid">
                  {filteredMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onSelect={setSelectedMovie} />
                  ))}
                </div>
              ) : (
                <div className="glass-panel empty-state">
                  <div className="empty-icon-wrap">
                    <Film size={32} />
                  </div>
                  <h3>No matching movies found in your vault</h3>
                  <p>
                    Your cinema collection has no items matching the active filter. Click &quot;+ Add Movie&quot; or search online to start!
                  </p>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
                    {hasActiveFilters && (
                      <button type="button" className="btn-secondary" onClick={clearFilters}>
                        Clear Filters
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-add-item"
                      style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}
                      onClick={() => setViewMode('realtime')}
                    >
                      <Search size={16} />
                      <span>Explore Real-Time Cinema</span>
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(true)}>
                      <Plus size={16} />
                      <span>Manual Form</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Detail Modal */}
      <DetailModal
        item={selectedMovie}
        type="movie"
        onClose={() => setSelectedMovie(null)}
      />

      {/* Add Movie Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultType="movie"
      />
    </div>
  );
};

export default Movies;
