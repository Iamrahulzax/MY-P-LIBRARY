import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import DetailModal from '../components/DetailModal';
import FilterBar from '../components/FilterBar';
import AddItemModal from '../components/AddItemModal';
import { Film, Plus, Bookmark } from 'lucide-react';

const Movies: React.FC = () => {
  const { movies } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genreFilter, setGenreFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
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
      { label: '👀 Watched', value: 'Watched', count: counts.Watched, color: '#10b981' },
      { label: '📌 Watchlist', value: 'Watchlist', count: counts.Watchlist, color: '#8b5cf6' },
      { label: '❤️ Favorite', value: 'Favorite', count: counts.Favorite, color: '#f43f5e' },
      { label: '🔄 Rewatch', value: 'Rewatch', count: counts.Rewatch, color: '#06b6d4' },
    ];
  }, [movies]);

  const sortOptions = [
    { label: '⭐ Highest Rating', value: 'rating-desc' },
    { label: '📅 Newest Release', value: 'year-desc' },
    { label: '🔤 Title (A - Z)', value: 'title-asc' },
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
  }, [movies, searchQuery, statusFilter, genreFilter, ratingFilter, sortBy]);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || genreFilter !== 'ALL' || ratingFilter !== 'ALL';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setGenreFilter('ALL');
    setRatingFilter('ALL');
  };

  const watchlistCount = movies.filter((m) => m.status === 'Watchlist').length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Film size={36} color="#c084fc" />
            <span>Movie Collection</span>
          </h1>
          <p className="page-subtitle">
            Personal archive of every film seen, directors, reviews, and cinema watchlist.
          </p>
        </div>

        <div className="page-stats-summary">
          <div className="stat-chip">
            <Film size={16} color="#c084fc" />
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
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)' }}
          >
            <Plus size={16} />
            <span>Add Movie</span>
          </button>
        </div>
      </div>

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
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={sortOptions}
        placeholder="Search movies by title, director, genre, year..."
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

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
          <h3>No matching movies found</h3>
          <p>
            {hasActiveFilters
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'Your cinema collection is empty. Click "+ Add Movie" above to add your first film!'}
          </p>
          {hasActiveFilters && (
            <button type="button" className="btn-secondary" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}
        </div>
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
