import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import DetailModal from '../components/DetailModal';
import FilterBar from '../components/FilterBar';
import AddItemModal from '../components/AddItemModal';
import RealtimeMediaSearch from '../components/RealtimeMediaSearch';
import { Film, Plus, Bookmark, Search, Sparkles } from 'lucide-react';

const Movies: React.FC = () => {
  const { movies } = useLibrary();

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
              Search TMDB, TVMaze, and verified theatrical archives with real-time posters, directors, and instant 1-click &quot;Add to Vault&quot;.
            </p>
          </div>

          <RealtimeMediaSearch
            type="movie"
            initialQuery={searchQuery}
            standalone={true}
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
            placeholder="Search your movies by title, director, genre, year..."
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />

          {/* Quick Real-Time Search Upsell Banner if searching */}
          {searchQuery.trim().length > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={16} color="#c084fc" />
                <span style={{ fontSize: '13px', color: '#fff' }}>
                  Looking for &quot;<strong>{searchQuery}</strong>&quot; beyond your personal shelf?
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('realtime')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: '#a855f7',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <span>Search Real-Time Online & Add →</span>
              </button>
            </div>
          )}

          {/* Movies Grid or Empty State */}
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
                {searchQuery.trim()
                  ? `"${searchQuery}" is not currently on your shelf.`
                  : 'Your cinema collection is empty. Click "+ Add Movie" or search online to start!'}
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
                {searchQuery.trim() && (
                  <button
                    type="button"
                    className="btn-add-item"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}
                    onClick={() => setViewMode('realtime')}
                  >
                    <Search size={16} />
                    <span>Search &quot;{searchQuery}&quot; in Real-Time & Add to Vault</span>
                  </button>
                )}
                {hasActiveFilters && (
                  <button type="button" className="btn-secondary" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(true)}>
                  <Plus size={16} />
                  <span>Manual Form</span>
                </button>
              </div>
            </div>
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
