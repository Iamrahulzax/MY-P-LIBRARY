import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Game, Movie } from '../types';
import DetailModal from '../components/DetailModal';
import { History, Gamepad2, Film, Star } from 'lucide-react';

interface TimelineItem {
  year: number;
  dateStr: string;
  type: 'game' | 'movie';
  item: Game | Movie;
}

const Timeline: React.FC = () => {
  const { games, movies } = useLibrary();

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Group items by year
  const timelineByYear = useMemo(() => {
    const list: TimelineItem[] = [];

    games.forEach((g) => {
      let year = g.releaseYear;
      if (g.datePlayed) {
        const parsed = parseInt(g.datePlayed.slice(0, 4), 10);
        if (!isNaN(parsed)) year = parsed;
      }
      list.push({
        year,
        dateStr: g.datePlayed || String(g.releaseYear),
        type: 'game',
        item: g,
      });
    });

    movies.forEach((m) => {
      let year = m.releaseYear;
      if (m.dateWatched) {
        const parsed = parseInt(m.dateWatched.slice(0, 4), 10);
        if (!isNaN(parsed)) year = parsed;
      }
      list.push({
        year,
        dateStr: m.dateWatched || String(m.releaseYear),
        type: 'movie',
        item: m,
      });
    });

    // Sort descending by date/year
    list.sort((a, b) => b.dateStr.localeCompare(a.dateStr));

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
  }, [games, movies]);

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
      </div>

      <div className="timeline-container">
        {timelineByYear.map(({ year, items }) => (
          <div key={year} className="timeline-year-block">
            <div className="timeline-year-header">
              <span className="timeline-year-badge">{year}</span>
              <div className="timeline-line" />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {items.length} experiences logged
              </span>
            </div>

            <div className="timeline-items-list">
              {items.map(({ item, type }, idx) => {
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: '#151c2e'
                      }}>
                        <img
                          src={item.cover}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          <strong style={{ fontSize: '15px', color: '#fff' }}>{item.name}</strong>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span>{item.genre}</span>
                          <span>•</span>
                          <span style={{ color: item.status === 'Completed' || item.status === 'Watched' ? '#34d399' : '#60a5fa', fontWeight: 600 }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span className="rating-badge">
                        <Star size={12} fill="#fbbf24" />
                        {item.rating}/10
                      </span>

                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isGame ? game.datePlayed || game.releaseYear : movie.dateWatched || movie.releaseYear}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

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
