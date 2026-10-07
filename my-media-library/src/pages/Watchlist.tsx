import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Game, Movie } from '../types';
import GameCard from '../components/GameCard';
import MovieCard from '../components/MovieCard';
import DetailModal from '../components/DetailModal';
import AddItemModal from '../components/AddItemModal';
import { Bookmark, Gamepad2, Film, CheckCircle2, Play, Plus } from 'lucide-react';

const Watchlist: React.FC = () => {
  const { games, movies, updateGame, updateMovie } = useLibrary();

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'game' | 'movie'>('game');

  const backlogGames = games.filter((g) => g.status === 'Backlog');
  const watchlistMovies = movies.filter((m) => m.status === 'Watchlist');

  const startPlayingGame = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    updateGame({
      ...game,
      status: 'Playing',
      datePlayed: new Date().toISOString().split('T')[0]
    });
  };

  const markMovieWatched = (e: React.MouseEvent, movie: Movie) => {
    e.stopPropagation();
    updateMovie({
      ...movie,
      status: 'Watched',
      dateWatched: new Date().toISOString().split('T')[0]
    });
  };

  const handleOpenAdd = (type: 'game' | 'movie') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Gamepad2 size={22} color="var(--primary-light)" />
            Games To Play Next ({backlogGames.length})
          </h2>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleOpenAdd('game')}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <Plus size={15} />
            <span>Add Backlog Game</span>
          </button>
        </div>

        {backlogGames.length > 0 ? (
          <div className="cards-grid">
            {backlogGames.map((game) => (
              <div key={game.id} className="watchlist-card-item">
                <GameCard game={game} onSelect={setSelectedGame} />
                <button
                  type="button"
                  onClick={(e) => startPlayingGame(e, game)}
                  className="btn-quick-action btn-start-playing"
                  title="Mark as Currently Playing"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Start Playing</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel empty-state" style={{ padding: '36px 20px' }}>
            <p>No games in your backlog! Keep gaming or queue new ones.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleOpenAdd('game')}
            >
              + Queue a Game
            </button>
          </div>
        )}
      </section>

      {/* Movies Watchlist Section */}
      <section style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Film size={22} color="#c084fc" />
            Movies Watchlist ({watchlistMovies.length})
          </h2>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleOpenAdd('movie')}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <Plus size={15} />
            <span>Add Watchlist Movie</span>
          </button>
        </div>

        {watchlistMovies.length > 0 ? (
          <div className="movies-grid">
            {watchlistMovies.map((movie) => (
              <div key={movie.id} className="watchlist-card-item">
                <MovieCard movie={movie} onSelect={setSelectedMovie} />
                <button
                  type="button"
                  onClick={(e) => markMovieWatched(e, movie)}
                  className="btn-quick-action btn-mark-watched"
                  title="Mark as Watched"
                >
                  <CheckCircle2 size={13} />
                  <span>Mark as Watched</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel empty-state" style={{ padding: '36px 20px' }}>
            <p>Your movie watchlist is empty! Browse movies or add one to queue it.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleOpenAdd('movie')}
            >
              + Queue a Movie
            </button>
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

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultType={addModalType}
      />
    </div>
  );
};

export default Watchlist;
