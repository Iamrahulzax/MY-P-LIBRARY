import React from 'react';
import type { Game, Movie, GameStatus, MovieStatus } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { X, Star, Heart, Clock, Calendar, Film, Gamepad2, Trash2, Clapperboard } from 'lucide-react';
import MediaPoster from './MediaPoster/MediaPoster';

interface Props {
  item: Game | Movie | null;
  type: 'game' | 'movie';
  onClose: () => void;
}

const DetailModal: React.FC<Props> = ({ item, type, onClose }) => {
  const { updateGame, updateMovie, deleteGame, deleteMovie, toggleGameFavorite, toggleMovieFavorite } = useLibrary();

  if (!item) return null;

  const isGame = type === 'game';
  const game = item as Game;
  const movie = item as Movie;

  const handleStatusChange = (newStatus: string) => {
    if (isGame) {
      updateGame({ ...game, status: newStatus as GameStatus });
    } else {
      updateMovie({ ...movie, status: newStatus as MovieStatus });
    }
  };

  const handleRatingChange = (newRating: number) => {
    if (isGame) {
      updateGame({ ...game, rating: newRating });
    } else {
      updateMovie({ ...movie, rating: newRating });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove "${item.name}" from your shelf?`)) {
      if (isGame) deleteGame(game.id);
      else deleteMovie(movie.id);
      onClose();
    }
  };

  const handleToggleFav = () => {
    if (isGame) toggleGameFavorite(game.id);
    else toggleMovieFavorite(movie.id);
  };

  const gameStatuses: GameStatus[] = ['Playing', 'Completed', 'On Hold', 'Dropped', 'Backlog', 'Replaying'];
  const movieStatuses: MovieStatus[] = ['Watched', 'Watchlist', 'Favorite', 'Rewatch'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Hero Header */}
        <div className="modal-header-hero">
          <MediaPoster
            title={item.name}
            type={isGame ? 'game' : 'movie'}
            year={item.releaseYear}
            platform={isGame ? game.platform : undefined}
            customCover={item.cover}
            aspectRatio="banner"
            className="modal-hero-image"
          />
          <div className="modal-hero-gradient" />
          
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>

          <div className="modal-hero-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="platform-pill">
                {isGame ? <Gamepad2 size={13} /> : <Film size={13} />}
                {isGame ? game.platform : movie.director || 'Cinema'}
              </span>
              <span className="platform-pill">
                <Calendar size={13} />
                {item.releaseYear}
              </span>
            </div>
            <h2 style={{ fontSize: '28px', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {item.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Status & Quick Actions Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '14px 18px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
              <select
                className="filter-select"
                value={item.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ height: '36px', padding: '0 12px' }}
              >
                {isGame
                  ? gameStatuses.map((st) => <option key={st} value={st}>{st}</option>)
                  : movieStatuses.map((st) => <option key={st} value={st}>{st}</option>)
                }
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                className={`fav-toggle-btn ${item.favorite ? 'is-fav' : ''}`}
                onClick={handleToggleFav}
                title="Toggle Favorite"
                style={{ width: '38px', height: '38px' }}
              >
                <Heart size={18} fill={item.favorite ? '#f43f5e' : 'none'} />
              </button>

              <button
                className="btn-secondary"
                onClick={handleDelete}
                style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '6px 14px' }}
                title="Delete item"
              >
                <Trash2 size={15} />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Rating Editor */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Personal Rating</span>
              <strong style={{ color: '#fbbf24' }}>{item.rating} / 10</strong>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: star <= item.rating ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: star <= item.rating ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid var(--border-subtle)',
                    color: star <= item.rating ? '#fbbf24' : 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Star size={12} fill={star <= item.rating ? '#fbbf24' : 'none'} />
                  {star}
                </button>
              ))}
            </div>
          </div>

          {/* Details Row */}
          <div className="form-row-2">
            <div className="stat-chip">
              <span style={{ color: 'var(--text-muted)' }}>Genre:</span>
              <strong>{item.genre}</strong>
            </div>

            {isGame ? (
              <div className="stat-chip">
                <Clock size={16} color="var(--primary-light)" />
                <span style={{ color: 'var(--text-muted)' }}>Hours:</span>
                <strong>{game.hoursPlayed}h</strong>
              </div>
            ) : (
              <div className="stat-chip">
                <Clapperboard size={16} color="var(--primary-light)" />
                <span style={{ color: 'var(--text-muted)' }}>Director:</span>
                <strong>{movie.director || 'N/A'}</strong>
              </div>
            )}
          </div>

          {/* Personal Review */}
          {item.review && (
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--primary-light)', fontWeight: 700 }}>
                💭 Personal Review
              </label>
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#e2e8f0'
              }}>
                {item.review}
              </div>
            </div>
          )}

          {/* Personal Notes */}
          {item.notes && (
            <div className="form-group">
              <label className="form-label">📝 Personal Notes</label>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                "{item.notes}"
              </div>
            </div>
          )}

          {/* Tags / Collections */}
          {item.tags && item.tags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tags:</span>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
