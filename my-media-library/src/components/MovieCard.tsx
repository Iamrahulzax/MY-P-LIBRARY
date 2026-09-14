import React from 'react';
import type { Movie } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { Heart, Star, Clapperboard, Eye, Bookmark, RefreshCw } from 'lucide-react';
import MediaPoster from './MediaPoster/MediaPoster';

interface Props {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

const MovieCard: React.FC<Props> = ({ movie, onSelect }) => {
  const { toggleMovieFavorite } = useLibrary();

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
      {/* Real Theatrical Movie Poster */}
      <div className="card-media-wrapper">
        <MediaPoster
          title={movie.name}
          type="movie"
          year={movie.releaseYear}
          customCover={movie.cover}
          aspectRatio="cinema"
          className="card-media-image"
        />
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
