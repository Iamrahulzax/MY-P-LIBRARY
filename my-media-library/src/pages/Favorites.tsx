import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Game, Movie } from '../types';
import GameCard from '../components/GameCard';
import MovieCard from '../components/MovieCard';
import DetailModal from '../components/DetailModal';
import { Heart, Trophy, Gamepad2, Film } from 'lucide-react';

const Favorites: React.FC = () => {
  const { games, movies } = useLibrary();
  const [activeTab, setActiveTab] = useState<'all' | 'games' | 'movies'>('all');

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const favGames = games.filter((g) => g.favorite);
  const favMovies = movies.filter((m) => m.favorite);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Heart size={36} color="#f43f5e" fill="#f43f5e" />
            <span>All-Time Favorites</span>
          </h1>
          <p className="page-subtitle">
            A golden showcase of the games and movies that touched you the most.
          </p>
        </div>

        <div className="page-stats-summary">
          <div className="stat-chip" style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}>
            <Trophy size={16} color="#fbbf24" />
            <span>Total Favorites:</span>
            <strong style={{ color: '#fb7185' }}>{favGames.length + favMovies.length}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '28px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px'
      }}>
        <button
          type="button"
          className={`status-chip-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          style={{ fontSize: '14px', padding: '8px 18px' }}
        >
          All Favorites ({favGames.length + favMovies.length})
        </button>

        <button
          type="button"
          className={`status-chip-btn ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
          style={{ fontSize: '14px', padding: '8px 18px' }}
        >
          <Gamepad2 size={16} />
          Favorite Games ({favGames.length})
        </button>

        <button
          type="button"
          className={`status-chip-btn ${activeTab === 'movies' ? 'active' : ''}`}
          onClick={() => setActiveTab('movies')}
          style={{ fontSize: '14px', padding: '8px 18px' }}
        >
          <Film size={16} />
          Favorite Movies ({favMovies.length})
        </button>
      </div>

      {/* Games Section */}
      {(activeTab === 'all' || activeTab === 'games') && favGames.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Gamepad2 size={20} color="var(--primary-light)" />
            Favorite Games
          </h2>
          <div className="cards-grid">
            {favGames.map((game) => (
              <GameCard key={game.id} game={game} onSelect={setSelectedGame} />
            ))}
          </div>
        </section>
      )}

      {/* Movies Section */}
      {(activeTab === 'all' || activeTab === 'movies') && favMovies.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Film size={20} color="#c084fc" />
            Favorite Movies
          </h2>
          <div className="movies-grid">
            {favMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onSelect={setSelectedMovie} />
            ))}
          </div>
        </section>
      )}

      {favGames.length === 0 && favMovies.length === 0 && (
        <div className="glass-panel empty-state">
          <div className="empty-icon-wrap" style={{ color: '#f43f5e' }}>
            <Heart size={32} />
          </div>
          <h3>No favorites yet</h3>
          <p>Click the heart icon on any game or movie to bookmark it into your favorites!</p>
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

export default Favorites;
