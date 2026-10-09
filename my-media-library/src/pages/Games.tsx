import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Game } from '../types';
import GameCard from '../components/GameCard';
import DetailModal from '../components/DetailModal';
import FilterBar from '../components/FilterBar';
import AddItemModal from '../components/AddItemModal';
import { Gamepad2, Plus, Clock } from 'lucide-react';

const Games: React.FC = () => {
  const { games } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genreFilter, setGenreFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [isFavoriteOnly, setIsFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating-desc');

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Extract unique genres
  const genreOptions = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => {
      g.genre.split('/').forEach((part) => set.add(part.trim()));
    });
    return Array.from(set).sort();
  }, [games]);

  // Extract unique platforms
  const platformOptions = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => {
      if (g.platform) {
        g.platform.split('/').forEach((part) => set.add(part.trim()));
      }
    });
    return Array.from(set).sort();
  }, [games]);

  // Status options with counts and status colors
  const statusOptions = useMemo(() => {
    const counts: Record<string, number> = {
      Playing: 0,
      Completed: 0,
      'On Hold': 0,
      Dropped: 0,
      Backlog: 0,
      Replaying: 0,
    };

    games.forEach((g) => {
      if (counts[g.status] !== undefined) {
        counts[g.status]++;
      }
    });

    return [
      { label: 'All Games', value: 'ALL', count: games.length },
      { label: 'Playing', value: 'Playing', count: counts.Playing, color: '#2563eb' },
      { label: 'Completed', value: 'Completed', count: counts.Completed, color: '#10b981' },
      { label: 'On Hold', value: 'On Hold', count: counts['On Hold'], color: '#f59e0b' },
      { label: 'Dropped', value: 'Dropped', count: counts.Dropped, color: '#ef4444' },
      { label: 'Backlog', value: 'Backlog', count: counts.Backlog, color: '#64748b' },
      { label: 'Replaying', value: 'Replaying', count: counts.Replaying, color: '#0284c7' },
    ];
  }, [games]);

  const sortOptions = [
    { label: 'Highest Rating', value: 'rating-desc' },
    { label: 'Most Hours Played', value: 'hours-desc' },
    { label: 'Newest Release', value: 'year-desc' },
    { label: 'Title (A - Z)', value: 'title-asc' },
  ];

  // Filtering and Sorting
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = game.name.toLowerCase().includes(q);
        const matchesGenre = game.genre.toLowerCase().includes(q);
        const matchesPlatform = game.platform.toLowerCase().includes(q);
        const matchesYear = String(game.releaseYear).includes(q);
        if (!matchesName && !matchesGenre && !matchesPlatform && !matchesYear) {
          return false;
        }
      }

      // Status match
      if (statusFilter !== 'ALL' && game.status !== statusFilter) {
        return false;
      }

      // Genre match
      if (genreFilter !== 'ALL' && !game.genre.toLowerCase().includes(genreFilter.toLowerCase())) {
        return false;
      }

      // Platform match
      if (platformFilter !== 'ALL' && !game.platform.toLowerCase().includes(platformFilter.toLowerCase())) {
        return false;
      }

      // Favorite match
      if (isFavoriteOnly && !game.favorite) {
        return false;
      }

      // Rating match
      if (ratingFilter !== 'ALL') {
        const minRating = Number(ratingFilter);
        if (game.rating < minRating) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'hours-desc') return b.hoursPlayed - a.hoursPlayed;
      if (sortBy === 'year-desc') return b.releaseYear - a.releaseYear;
      if (sortBy === 'title-asc') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [games, searchQuery, statusFilter, genreFilter, platformFilter, ratingFilter, isFavoriteOnly, sortBy]);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || genreFilter !== 'ALL' || platformFilter !== 'ALL' || ratingFilter !== 'ALL' || isFavoriteOnly;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setGenreFilter('ALL');
    setPlatformFilter('ALL');
    setRatingFilter('ALL');
    setIsFavoriteOnly(false);
  };

  const totalHours = games.reduce((acc, g) => acc + (Number(g.hoursPlayed) || 0), 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Gamepad2 size={36} color="#f5f5f5" />
            <span>Gaming Collection</span>
          </h1>
          <p className="page-subtitle">
            Catalog of every title played, hours invested, statuses, and <span className="highlight">personal ratings</span>.
          </p>
        </div>

        <div className="page-stats-summary">
          <div className="stat-chip">
            <Gamepad2 size={16} color="var(--primary-light)" />
            <span>Total Games:</span>
            <strong>{games.length}</strong>
          </div>
          <div className="stat-chip">
            <Clock size={16} color="#38bdf8" />
            <span>Total Time:</span>
            <strong>{totalHours} hours</strong>
          </div>
          <button
            type="button"
            className="btn-add-item"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Game</span>
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
        platformFilter={platformFilter}
        onPlatformChange={setPlatformFilter}
        platformOptions={platformOptions}
        ratingFilter={ratingFilter}
        onRatingChange={setRatingFilter}
        isFavoriteOnly={isFavoriteOnly}
        onFavoriteToggle={() => setIsFavoriteOnly(!isFavoriteOnly)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={sortOptions}
        placeholder="Search games by title, platform, genre, year..."
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {/* Games Grid or Empty State */}
      {filteredGames.length > 0 ? (
        <div className="cards-grid">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onSelect={setSelectedGame} />
          ))}
        </div>
      ) : (
        <div className="glass-panel empty-state">
          <div className="empty-icon-wrap">
            <Gamepad2 size={32} />
          </div>
          <h3>No matching games found</h3>
          <p>
            {hasActiveFilters
              ? 'Try changing your search keywords, status filter, or genre options.'
              : 'Your gaming library is empty. Click "+ Add Game" above to catalog your first title!'}
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
        item={selectedGame}
        type="game"
        onClose={() => setSelectedGame(null)}
      />

      {/* Add Game Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultType="game"
      />
    </div>
  );
};

export default Games;
