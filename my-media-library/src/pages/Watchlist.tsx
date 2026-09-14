import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Game, Movie } from '../types';
import GameCard from '../components/GameCard';
import MovieCard from '../components/MovieCard';
import DetailModal from '../components/DetailModal';
import { Bookmark, Gamepad2, Film, CheckCircle2, Play } from 'lucide-react';

const Watchlist: React.FC = () => {
  const { games, movies, updateGame, updateMovie } = useLibrary();

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const backlogGames = games.filter((g) => g.status === 'Backlog');
  const watchlistMovies = movies.filter((m) => m.status === 'Watchlist');

  const startPlayingGame = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    updateGame({ ...game, status: 'Playing' });
  };

  const markMovieWatched = (e: React.MouseEvent, movie: Movie) => {
    e.stopPropagation();
    updateMovie({
      ...movie,
      status: 'Watched',
      dateWatched: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Bookmark size={36} color="#c084fc" />
            <span>Backlog & Watchlist</span>
          </h1>
          <p className="page-subtitle">
            Things you haven’t experienced yet, queued up and ready for your next adventure.
          </p>
        </div>

        <div className="page-stats-summary">
          <div className="stat-chip">
            <Gamepad2 size={16} color="var(--primary-light)" />
            <span>Games Queued:</span>
            <strong>{backlogGames.length}</strong>
          </div>
          <div className="stat-chip">
            <Film size={16} color="#c084fc" />
            <span>Movies Queued:</span>
            <strong>{watchlistMovies.length}</strong>
          </div>
        </div>
      </div>

      {/* Games Backlog Section */}
      <section style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Gamepad2 size={22} color="var(--primary-light)" />
            Games To Play Next ({backlogGames.length})
          </h2>
        </div>

        {backlogGames.length > 0 ? (
          <div className="cards-grid">
            {backlogGames.map((game) => (
              <div key={game.id} style={{ position: 'relative' }}>
                <GameCard game={game} onSelect={setSelectedGame} />
                <button
                  type="button"
                  onClick={(e) => startPlayingGame(e, game)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '50px',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(59, 130, 246, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                  }}
                  title="Mark as Currently Playing"
                >
                  <Play size={11} fill="#fff" />
                  Start Playing
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel empty-state" style={{ padding: '36px 20px' }}>
            <p>No games in your backlog! Keep gaming or queue new ones from the Games page.</p>
          </div>
        )}
      </section>

      {/* Movies Watchlist Section */}
      <section style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Film size={22} color="#c084fc" />
            Movies Watchlist ({watchlistMovies.length})
          </h2>
        </div>

        {watchlistMovies.length > 0 ? (
          <div className="movies-grid">
            {watchlistMovies.map((movie) => (
              <div key={movie.id} style={{ position: 'relative' }}>
                <MovieCard movie={movie} onSelect={setSelectedMovie} />
                <button
                  type="button"
                  onClick={(e) => markMovieWatched(e, movie)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '50px',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                  }}
                  title="Mark as Watched"
                >
                  <CheckCircle2 size={11} />
                  Mark Watched
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel empty-state" style={{ padding: '36px 20px' }}>
            <p>Your movie watchlist is empty! Browse movies or add one to queue it.</p>
          </div>
        )}
      </section>

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

export default Watchlist;
