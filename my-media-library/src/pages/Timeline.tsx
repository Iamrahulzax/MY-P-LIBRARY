import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Game, Movie } from '../types';
import DetailModal from '../components/DetailModal';
import MediaPoster from '../components/MediaPoster/MediaPoster';
import { History, Gamepad2, Film, Star, Calendar } from 'lucide-react';

interface TimelineItem {
  year: number;
  dateStr: string;
  type: 'game' | 'movie';
  item: Game | Movie;
  isBacklog: boolean;
}

const Timeline: React.FC = () => {
  const { games, movies } = useLibrary();

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<'experienced' | 'all' | 'games' | 'movies'>('experienced');

  // Group items by year
  const timelineByYear = useMemo(() => {
    const list: TimelineItem[] = [];

    // Filter games based on timeline tab
    games.forEach((g) => {
      const isBacklog = g.status === 'Backlog';
      if (timelineFilter === 'experienced' && isBacklog) return;
      if (timelineFilter === 'movies') return;

      let year = g.releaseYear;
      if (g.datePlayed) {
        const parsed = parseInt(g.datePlayed.slice(0, 4), 10);
        if (!isNaN(parsed)) year = parsed;
      }

      list.push({
        year,
        dateStr: g.datePlayed || `${year}-01-01`,
        type: 'game',
        item: g,
        isBacklog
      });
    });

    // Filter movies based on timeline tab
    movies.forEach((m) => {
      const isWatchlist = m.status === 'Watchlist';
      if (timelineFilter === 'experienced' && isWatchlist) return;
      if (timelineFilter === 'games') return;

      let year = m.releaseYear;
      if (m.dateWatched) {
        const parsed = parseInt(m.dateWatched.slice(0, 4), 10);
        if (!isNaN(parsed)) year = parsed;
      }

      list.push({
        year,
        dateStr: m.dateWatched || `${year}-01-01`,
        type: 'movie',
        item: m,
        isBacklog: isWatchlist
      });
    });

    // Sort descending by year first, then date string
    list.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.dateStr.localeCompare(a.dateStr);
    });

    const map: Record<number, TimelineItem[]> = {};
    list.forEach((t) => {
      if (!map[t.year]) map[t.year] = [];
      map[t.year].push(t);
    });

    // Return sorted year arrays
    const sortedYears = Object.keys(map)
      .map(Number)
      .sort((a, b) => b - a);

    return sortedYears.map((yr) => ({
      year: yr,
      items: map[yr],
    }));
  }, [games, movies, timelineFilter]);

  const totalItemsCount = timelineByYear.reduce((acc, curr) => acc + curr.items.length, 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <History size={36} color="#38bdf8" />
            <span>My Entertainment History</span>
          </h1>
          <p className="page-subtitle">
            A chronological memory record of everything experienced, completed, and enjoyed year by year.
          </p>
        </div>

        <div className="page-stats-summary">
          <div className="stat-chip">
            <Calendar size={16} color="#38bdf8" />
            <span>Recorded Years:</span>
            <strong>{timelineByYear.length}</strong>
          </div>
          <div className="stat-chip">
            <span>Logged Events:</span>
            <strong>{totalItemsCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '28px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          className={`status-chip-btn ${timelineFilter === 'experienced' ? 'active' : ''}`}
          onClick={() => setTimelineFilter('experienced')}
        >
          Played & Watched Only
        </button>

        <button
          type="button"
          className={`status-chip-btn ${timelineFilter === 'all' ? 'active' : ''}`}
          onClick={() => setTimelineFilter('all')}
        >
          All Timeline Records (Inc. Backlog)
        </button>

        <button
          type="button"
          className={`status-chip-btn ${timelineFilter === 'games' ? 'active' : ''}`}
          onClick={() => setTimelineFilter('games')}
        >
          <Gamepad2 size={15} />
          Games Only
        </button>

        <button
          type="button"
          className={`status-chip-btn ${timelineFilter === 'movies' ? 'active' : ''}`}
          onClick={() => setTimelineFilter('movies')}
        >
          <Film size={15} />
          Movies Only
        </button>
      </div>

      {/* Timeline List */}
      {timelineByYear.length > 0 ? (
        <div className="timeline-container">
          {timelineByYear.map(({ year, items }) => (
            <div key={year} className="timeline-year-block">
              <div className="timeline-year-header">
                <span className="timeline-year-badge">{year}</span>
                <div className="timeline-line" />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {items.length} {items.length === 1 ? 'experience' : 'experiences'} logged
                </span>
              </div>

              <div className="timeline-items-list">
                {items.map(({ item, type, isBacklog }, idx) => {
                  const isGame = type === 'game';
                  const game = item as Game;
                  const movie = item as Movie;

                  return (
                    <div
                      key={idx}
                      className="timeline-card"
                      onClick={() => (isGame ? setSelectedGame(game) : setSelectedMovie(movie))}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="timeline-card-main" style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: '#151c2e'
                        }}>
                          <MediaPoster
                            title={item.name}
                            type={isGame ? 'game' : 'movie'}
                            year={item.releaseYear}
                            customCover={item.cover}
                            aspectRatio="square"
                          />
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: isGame ? 'rgba(99, 102, 241, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                              color: isGame ? 'var(--primary-light)' : '#c084fc'
                            }}>
                              {isGame ? <Gamepad2 size={11} /> : <Film size={11} />}
                              {isGame ? 'GAME' : 'MOVIE'}
                            </span>
                            <strong style={{ fontSize: '15px', color: '#fff' }} className="truncate">
                              {item.name}
                            </strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', flexWrap: 'wrap' }}>
                            <span>{item.genre}</span>
                            <span>•</span>
                            <span style={{
                              color: item.status === 'Completed' || item.status === 'Watched'
                                ? '#34d399'
                                : isBacklog
                                ? '#a855f7'
                                : '#60a5fa',
                              fontWeight: 600
                            }}>
                              {item.status}
                            </span>
                            {isGame && game.hoursPlayed > 0 && (
                              <>
                                <span>•</span>
                                <span>{game.hoursPlayed}h played</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="timeline-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                        <span className="rating-badge">
                          <Star size={12} fill="#fbbf24" />
                          {item.rating}/10
                        </span>

                        <span className="timeline-card-date" style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '85px', textAlign: 'right' }}>
                          {isGame
                            ? (game.datePlayed || (isBacklog ? 'Backlog' : `Rel. ${game.releaseYear}`))
                            : (movie.dateWatched || (isBacklog ? 'Watchlist' : `Rel. ${movie.releaseYear}`))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel empty-state">
          <History size={32} color="#38bdf8" />
          <h3 style={{ marginTop: '14px' }}>No timeline records found</h3>
          <p>Try switching to "All Timeline Records (Inc. Backlog)" or log your first played game or watched movie!</p>
        </div>
      )}

      <DetailModal
        item={selectedGame}
        type="game"
        onClose={() => setSelectedGame(null)}
      />

      <DetailModal
        item={selectedMovie}
        type="movie"
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
};

export default Timeline;
