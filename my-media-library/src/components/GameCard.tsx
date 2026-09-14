import React from 'react';
import type { Game } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { Heart, Star, Clock, Monitor, Play, CheckCircle2, PauseCircle, XCircle, Bookmark, RefreshCw } from 'lucide-react';
import MediaPoster from './MediaPoster/MediaPoster';

interface Props {
  game: Game;
  onSelect?: (game: Game) => void;
}

const GameCard: React.FC<Props> = ({ game, onSelect }) => {
  const { toggleGameFavorite } = useLibrary();

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleGameFavorite(game.id);
  };

  const getStatusIcon = (status: Game['status']) => {
    switch (status) {
      case 'Playing': return <Play size={11} fill="currentColor" />;
      case 'Completed': return <CheckCircle2 size={12} />;
      case 'On Hold': return <PauseCircle size={12} />;
      case 'Dropped': return <XCircle size={12} />;
      case 'Backlog': return <Bookmark size={12} />;
      case 'Replaying': return <RefreshCw size={11} />;
      default: return null;
    }
  };

  const getStatusClass = (status: Game['status']) => {
    switch (status) {
      case 'Playing': return 'status-badge-playing';
      case 'Completed': return 'status-badge-completed';
      case 'On Hold': return 'status-badge-onhold';
      case 'Dropped': return 'status-badge-dropped';
      case 'Backlog': return 'status-badge-backlog';
      case 'Replaying': return 'status-badge-replaying';
      default: return '';
    }
  };

  return (
    <div className="game-card" onClick={() => onSelect && onSelect(game)}>
      {/* Real Game Poster / Cover */}
      <div className="card-media-wrapper">
        <MediaPoster
          title={game.name}
          type="game"
          year={game.releaseYear}
          platform={game.platform}
          customCover={game.cover}
          aspectRatio="portrait"
          className="card-media-image"
        />
        <div className="media-gradient-overlay" />

        {/* Top Badges */}
        <div className="card-top-badges">
          <span className="platform-pill">
            <Monitor size={12} />
            {game.platform}
          </span>
          <button
            type="button"
            className={`fav-toggle-btn ${game.favorite ? 'is-fav' : ''}`}
            onClick={handleFavClick}
            title={game.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={game.favorite ? '#f43f5e' : 'none'} />
          </button>
        </div>

        {/* Bottom Overlay Info */}
        <div className="card-bottom-overlay">
          <span className={`status-badge ${getStatusClass(game.status)}`}>
            {getStatusIcon(game.status)}
            {game.status}
          </span>
          <span className="rating-badge">
            <Star size={12} fill="#fbbf24" />
            {game.rating}/10
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="card-content">
        <h3 className="card-title" title={game.name}>{game.name}</h3>
        <div className="card-meta-line">
          <span>{game.genre}</span>
          <span className="meta-dot" />
          <span>{game.releaseYear}</span>
        </div>

        {game.notes && (
          <div className="card-notes-preview">
            "{game.notes}"
          </div>
        )}

        <div className="card-footer-tags">
          <div className="hours-tag">
            <Clock size={13} color="var(--primary-light)" />
            <span>{game.hoursPlayed}h played</span>
          </div>
          {game.datePlayed && (
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              {game.datePlayed}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
