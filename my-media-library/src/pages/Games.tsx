import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Game } from '../types';
import GameCard from '../components/GameCard';
import DetailModal from '../components/DetailModal';
import FilterBar from '../components/FilterBar';
import AddItemModal from '../components/AddItemModal';
import RealtimeMediaSearch from '../components/RealtimeMediaSearch';
import { Gamepad2, Plus, Clock, Search, Sparkles } from 'lucide-react';

const Games: React.FC = () => {
  const { games } = useLibrary();

  // Mode: 'vault' (saved library) or 'realtime' (live search & add)
  const [viewMode, setViewMode] = useState<'vault' | 'realtime'>('vault');

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
            Catalog of every title played, hours invested, statuses, and <span className="highlight">real-time Steam & game search</span>.
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
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}
          >
            <Plus size={16} />
            <span>Add Game</span>
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
              background: viewMode === 'vault' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              border: viewMode === 'vault' ? '1px solid var(--primary-light)' : '1px solid transparent',
              color: viewMode === 'vault' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Gamepad2 size={16} color={viewMode === 'vault' ? 'var(--primary-light)' : undefined} />
            <span>My Gaming Vault ({games.length})</span>
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
              background: viewMode === 'realtime' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              border: viewMode === 'realtime' ? '1px solid var(--primary-light)' : '1px solid transparent',
              color: viewMode === 'realtime' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={16} color={viewMode === 'realtime' ? 'var(--primary-light)' : undefined} />
            <span>Real-Time Online Search & Add</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'var(--primary-light)',
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
            Search any game on Steam & global archives to add straight to your Vault
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
              <Search size={20} color="var(--primary-light)" />
              <span>Real-Time Game Discovery</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Search Steam, RAWG, CheapShark, and verified box art archives with real-time covers and instant 1-click &quot;Add to Vault&quot;.
            </p>
          </div>

          <RealtimeMediaSearch
            type="game"
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
            placeholder="Search your games by title, platform, genre, year..."
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
              background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(56, 189, 248, 0.15) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={16} color="var(--primary-light)" />
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
                  background: 'var(--primary-light)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <span>Search Real-Time Steam & Add →</span>
              </button>
            </div>
          )}

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
              <h3>No matching games found in your vault</h3>
              <p>
                {searchQuery.trim()
                  ? `"${searchQuery}" is not currently in your gaming library.`
                  : 'Your gaming library is empty. Click "+ Add Game" or search Steam to start!'}
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
                {searchQuery.trim() && (
                  <button
                    type="button"
                    className="btn-add-item"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
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
