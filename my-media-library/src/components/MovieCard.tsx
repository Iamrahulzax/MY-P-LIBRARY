import React, { useState } from 'react';
import type { Movie } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { Heart, Star, Film, Clapperboard, Eye, Bookmark, RefreshCw } from 'lucide-react';

interface Props {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

const MovieCard: React.FC<Props> = ({ movie, onSelect }) => {
  const { toggleMovieFavorite } = useLibrary();
  const [imgError, setImgError] = useState(false);

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMovieFavorite(movie.id);
  };

  const getStatusIcon = (status: Movie['status']) => {
    switch (status) {
      case 'Watched': return <Eye size={12} />;
      case 'Watchlist': return <Bookmark size={12} />;
      case 'Favorite': return <Heart size={12} fill="currentColor" />;
      case 'Rewatch': return <RefreshCw size={11} />;
      default: return null;
    }
  };

  const getStatusClass = (status: Movie['status']) => {
    switch (status) {
      case 'Watched': return 'status-badge-watched';
      case 'Watchlist': return 'status-badge-watchlist';
      case 'Favorite': return 'status-badge-favorite';
      case 'Rewatch': return 'status-badge-rewatch';
      default: return '';
    }
  };

  return (
    <div className="game-card movie-card" onClick={() => onSelect && onSelect(movie)}>
      {/* Media Image */}
      <div className="card-media-wrapper">
        {imgError ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #31103f 0%, #0f172a 100%)',
            color: '#c084fc',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Film size={44} style={{ marginBottom: '8px', opacity: 0.8 }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{movie.name}</span>
          </div>
        ) : (
          <img
            src={movie.cover}
            alt={movie.name}
            className="card-media-image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
        <div className="media-gradient-overlay" />

        {/* Top Badges */}
        <div className="card-top-badges">
          <span className="platform-pill" style={{ background: 'rgba(23, 17, 35, 0.85)' }}>
            <Clapperboard size={12} />
            {movie.releaseYear}
          </span>
          <button
            type="button"
            className={`fav-toggle-btn ${movie.favorite ? 'is-fav' : ''}`}
            onClick={handleFavClick}
            title={movie.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={movie.favorite ? '#f43f5e' : 'none'} />
          </button>
        </div>

        {/* Bottom Overlay Info */}
        <div className="card-bottom-overlay">
          <span className={`status-badge ${getStatusClass(movie.status)}`}>
            {getStatusIcon(movie.status)}
            {movie.status}
          </span>
          <span className="rating-badge">
            <Star size={12} fill="#fbbf24" />
            {movie.rating}/10
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="card-content">
        <h3 className="card-title" title={movie.name}>{movie.name}</h3>
        <div className="card-meta-line">
          <span>{movie.genre}</span>
          {movie.director && (
            <>
              <span className="meta-dot" />
              <span title={movie.director} style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {movie.director}
              </span>
            </>
          )}
        </div>

        {movie.notes && (
          <div className="card-notes-preview">
            "{movie.notes}"
          </div>
        )}

        <div className="card-footer-tags">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {movie.dateWatched ? `Watched ${movie.dateWatched}` : 'Watchlist'}
          </span>
          {movie.review && (
            <span style={{ fontSize: '11px', color: 'var(--primary-light)', fontWeight: 600 }}>
              Has Review 💬
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
