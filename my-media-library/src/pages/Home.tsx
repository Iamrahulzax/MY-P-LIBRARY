import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import type { Game, Movie } from '../types';
import GameCard from '../components/GameCard';
import MovieCard from '../components/MovieCard';
import DetailModal from '../components/DetailModal';
import AddItemModal from '../components/AddItemModal';
import ProfileModal from '../components/ProfileModal';
import {
  Gamepad2,
  Film,
  Heart,
  Clock,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Play,
  Flame,
  Plus
} from 'lucide-react';


const Home: React.FC = () => {
  const { games, movies, stats, profile } = useLibrary();

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Active / Playing items
  const currentlyPlaying = games.filter((g) => g.status === 'Playing' || g.status === 'Replaying');
  const topMasterpieces = [
    ...games.filter((g) => g.rating === 10).map((g) => ({ item: g, type: 'game' as const })),
    ...movies.filter((m) => m.rating === 10).map((m) => ({ item: m, type: 'movie' as const }))
  ].slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div className="hero-tag">
              <Sparkles size={14} />
              <span>Personal Entertainment Archive</span>
            </div>

            <button
              type="button"
              className="hero-profile-pill"
              onClick={() => setIsProfileModalOpen(true)}
              title="Click to edit profile or change avatar"
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="hero-profile-avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatars/cat-dev.jpg';
                }}
              />
              <div className="hero-profile-info">
                <span className="hero-profile-name">{profile.name}</span>
                <span className="hero-profile-tagline">{profile.tagline || 'Collector'}</span>
              </div>
              <span className="hero-profile-badge">Switch Avatar 🐱</span>
            </button>
          </div>


          <h1 className="hero-title">
            Every game you play.<br />
            Every movie you watch.<br />
            <span className="gradient-text">All in one personal shelf.</span>
          </h1>

          <p className="hero-description">
            Your private digital collection — remember what you’ve experienced, your personal ratings,
            hours invested, unfiltered reviews, and what you’re exploring next.
          </p>

          <div className="hero-quick-actions">
            <Link to="/games" className="btn-add-item" style={{ padding: '11px 22px' }}>
              <Gamepad2 size={18} />
              <span>Browse Games ({stats.totalGames})</span>
            </Link>

            <Link to="/movies" className="btn-secondary">
              <Film size={18} />
              <span>Browse Movies ({stats.totalMovies})</span>
            </Link>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={18} />
              <span>Log New Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap stat-icon-blue">
            <Gamepad2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalGames}</span>
            <span className="stat-label">Games Tracked</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap stat-icon-purple">
            <Film size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalMovies}</span>
            <span className="stat-label">Movies Watched</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap stat-icon-cyan">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalHoursPlayed}h</span>
            <span className="stat-label">Hours in Games</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap stat-icon-rose">
            <Heart size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.favoritesCount}</span>
            <span className="stat-label">All-Time Favorites</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap stat-icon-emerald">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completedGames}</span>
            <span className="stat-label">Completed Games</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap stat-icon-amber">
            <Bookmark size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.backlogCount + stats.watchlistCount}</span>
            <span className="stat-label">Backlog & Watchlist</span>
          </div>
        </div>
      </div>

      {/* Currently Playing / In Progress */}
      {currentlyPlaying.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Play size={16} fill="currentColor" />
              </div>
              <h2 style={{ fontSize: '24px', margin: 0 }}>Currently In Progress</h2>
            </div>
            <Link to="/games" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--primary-light)', fontWeight: 600 }}>
              View all games <ArrowRight size={15} />
            </Link>
          </div>

          <div className="cards-grid">
            {currentlyPlaying.map((game) => (
              <GameCard key={game.id} game={game} onSelect={setSelectedGame} />
            ))}
          </div>
        </section>
      )}

      {/* Hall of Fame / 10/10 Masterpieces */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flame size={18} />
            </div>
            <h2 style={{ fontSize: '24px', margin: 0 }}>⭐ 10 / 10 Masterpieces Showcase</h2>
          </div>
          <Link to="/favorites" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#fbbf24', fontWeight: 600 }}>
            All Favorites <ArrowRight size={15} />
          </Link>
        </div>

        <div className="cards-grid">
          {topMasterpieces.map(({ item, type }) =>
            type === 'game' ? (
              <GameCard key={item.id} game={item as Game} onSelect={setSelectedGame} />
            ) : (
              <MovieCard key={item.id} movie={item as Movie} onSelect={setSelectedMovie} />
            )
          )}
        </div>
      </section>

      {/* Detail Modals */}
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
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default Home;
