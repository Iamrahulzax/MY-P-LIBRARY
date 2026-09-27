import React, { useState, useEffect } from 'react';
import type { Game, Movie, GameStatus, MovieStatus } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { X, Star, Heart, Clock, Calendar, Film, Gamepad2, Trash2, Clapperboard, Edit3, Save } from 'lucide-react';
import MediaPoster from './MediaPoster/MediaPoster';

interface Props {
  item: Game | Movie | null;
  type: 'game' | 'movie';
  onClose: () => void;
}

const DetailModal: React.FC<Props> = ({ item, type, onClose }) => {
  const { games, movies, updateGame, updateMovie, deleteGame, deleteMovie, toggleGameFavorite, toggleMovieFavorite } = useLibrary();

  const isGame = type === 'game';
  const currentItem = isGame
    ? (games.find((g) => g.id === item?.id) || item)
    : (movies.find((m) => m.id === item?.id) || item);

  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(2024);
  const [rating, setRating] = useState<number>(8);
  const [cover, setCover] = useState('');
  const [notes, setNotes] = useState('');
  const [review, setReview] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  // Game specific edit state
  const [platform, setPlatform] = useState('PC');
  const [gameStatus, setGameStatus] = useState<GameStatus>('Playing');
  const [hoursPlayed, setHoursPlayed] = useState<number>(0);
  const [datePlayed, setDatePlayed] = useState('');

  // Movie specific edit state
  const [director, setDirector] = useState('');
  const [movieStatus, setMovieStatus] = useState<MovieStatus>('Watched');
  const [dateWatched, setDateWatched] = useState('');

  // Synchronize form when currentItem changes or edit mode toggles
  useEffect(() => {
    if (currentItem) {
      setName(currentItem.name || '');
      setGenre(currentItem.genre || '');
      setReleaseYear(currentItem.releaseYear || 2024);
      setRating(currentItem.rating || 8);
      setCover(currentItem.cover || '');
      setNotes(currentItem.notes || '');
      setReview(currentItem.review || '');
      setTagsStr(currentItem.tags ? currentItem.tags.join(', ') : '');

      if (isGame) {
        const g = currentItem as Game;
        setPlatform(g.platform || 'PC');
        setGameStatus(g.status || 'Playing');
        setHoursPlayed(g.hoursPlayed || 0);
        setDatePlayed(g.datePlayed || '');
      } else {
        const m = currentItem as Movie;
        setDirector(m.director || '');
        setMovieStatus(m.status || 'Watched');
        setDateWatched(m.dateWatched || '');
      }
    }
  }, [currentItem, isGame]);

  if (!currentItem) return null;

  const game = currentItem as Game;
  const movie = currentItem as Movie;

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
    if (window.confirm(`Are you sure you want to remove "${currentItem.name}" from your shelf?`)) {
      if (isGame) deleteGame(game.id);
      else deleteMovie(movie.id);
      onClose();
    }
  };

  const handleToggleFav = () => {
    if (isGame) toggleGameFavorite(game.id);
    else toggleMovieFavorite(movie.id);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedTags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (isGame) {
      updateGame({
        ...game,
        name: name.trim(),
        genre: genre.trim() || 'Action',
        releaseYear: Number(releaseYear) || 2024,
        rating: Number(rating) || 8,
        platform: platform.trim() || 'PC',
        status: gameStatus,
        hoursPlayed: Number(hoursPlayed) || 0,
        datePlayed: datePlayed.trim() || undefined,
        cover: cover.trim(),
        notes: notes.trim(),
        review: review.trim(),
        tags: parsedTags.length > 0 ? parsedTags : [genre.trim() || 'Action']
      });
    } else {
      updateMovie({
        ...movie,
        name: name.trim(),
        genre: genre.trim() || 'Drama',
        releaseYear: Number(releaseYear) || 2024,
        rating: Number(rating) || 8,
        director: director.trim(),
        status: movieStatus,
        dateWatched: dateWatched.trim() || undefined,
        cover: cover.trim(),
        notes: notes.trim(),
        review: review.trim(),
        tags: parsedTags.length > 0 ? parsedTags : [genre.trim() || 'Cinema']
      });
    }

    setIsEditing(false);
  };

  const gameStatuses: GameStatus[] = ['Playing', 'Completed', 'On Hold', 'Dropped', 'Backlog', 'Replaying'];
  const movieStatuses: MovieStatus[] = ['Watched', 'Watchlist', 'Favorite', 'Rewatch'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Hero Header */}
        <div className="modal-header-hero">
          <MediaPoster
            title={currentItem.name}
            type={isGame ? 'game' : 'movie'}
            year={currentItem.releaseYear}
            platform={isGame ? game.platform : undefined}
            customCover={currentItem.cover}
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
                {currentItem.releaseYear}
              </span>
            </div>
            <h2 style={{ fontSize: '28px', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {currentItem.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Quick Action & Mode Bar */}
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
                value={currentItem.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ height: '36px', padding: '0 12px' }}
              >
                {isGame
                  ? gameStatuses.map((st) => <option key={st} value={st}>{st}</option>)
                  : movieStatuses.map((st) => <option key={st} value={st}>{st}</option>)
                }
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className={`fav-toggle-btn ${currentItem.favorite ? 'is-fav' : ''}`}
                onClick={handleToggleFav}
                title={currentItem.favorite ? 'Remove from favorites' : 'Add to favorites'}
                style={{ width: '38px', height: '38px' }}
              >
                <Heart size={18} fill={currentItem.favorite ? '#f43f5e' : 'none'} />
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  color: isEditing ? '#60a5fa' : 'var(--text-secondary)',
                  borderColor: isEditing ? 'rgba(96, 165, 250, 0.5)' : undefined
                }}
                title={isEditing ? 'Cancel editing' : 'Edit details'}
              >
                <Edit3 size={15} />
                <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
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

          {/* EDIT FORM MODE */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">{isGame ? 'Game Title *' : 'Movie Title *'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Release Year</label>
                  <input
                    type="number"
                    min="1970"
                    max="2035"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                  />
                </div>
              </div>

              {isGame ? (
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Platform</label>
                    <input
                      type="text"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      placeholder="e.g. PC, PS5, Switch"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select value={gameStatus} onChange={(e) => setGameStatus(e.target.value as GameStatus)}>
                      {gameStatuses.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Director</label>
                    <input
                      type="text"
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      placeholder="Director name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select value={movieStatus} onChange={(e) => setMovieStatus(e.target.value as MovieStatus)}>
                      {movieStatuses.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Rating (1-10)</span>
                    <strong style={{ color: '#fbbf24' }}>{rating}/10 ⭐</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    style={{ accentColor: '#f59e0b', padding: '0', cursor: 'pointer' }}
                  />
                </div>

                {isGame ? (
                  <div className="form-group">
                    <label className="form-label">Hours Played</label>
                    <input
                      type="number"
                      min="0"
                      value={hoursPlayed}
                      onChange={(e) => setHoursPlayed(Number(e.target.value))}
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Date Watched</label>
                    <input
                      type="date"
                      value={dateWatched}
                      onChange={(e) => setDateWatched(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {isGame && (
                <div className="form-group">
                  <label className="form-label">Date Played / Completed</label>
                  <input
                    type="date"
                    value={datePlayed}
                    onChange={(e) => setDatePlayed(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Poster / Cover URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags / Collections (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Best Games, Must Play, Sci-Fi"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Personal Notes</label>
                <input
                  type="text"
                  placeholder="Brief note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Personal Review</label>
                <textarea
                  rows={3}
                  placeholder="Your honest thoughts..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-add-item"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            /* VIEW MODE */
            <>
              {/* Rating Editor */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Personal Rating</span>
                  <strong style={{ color: '#fbbf24' }}>{currentItem.rating} / 10</strong>
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
                        background: star <= currentItem.rating ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: star <= currentItem.rating ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid var(--border-subtle)',
                        color: star <= currentItem.rating ? '#fbbf24' : 'var(--text-muted)',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Star size={12} fill={star <= currentItem.rating ? '#fbbf24' : 'none'} />
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Row */}
              <div className="form-row-2">
                <div className="stat-chip">
                  <span style={{ color: 'var(--text-muted)' }}>Genre:</span>
                  <strong>{currentItem.genre}</strong>
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

              {/* Date details if present */}
              {((isGame && game.datePlayed) || (!isGame && movie.dateWatched)) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <Calendar size={14} color="var(--primary-light)" />
                  <span>
                    {isGame ? `Logged / Played on: ${game.datePlayed}` : `Watched on: ${movie.dateWatched}`}
                  </span>
                </div>
              )}

              {/* Personal Review */}
              {currentItem.review ? (
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
                    {currentItem.review}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>No review written yet.</span>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    style={{ color: 'var(--primary-light)', fontSize: '12px', fontWeight: 600 }}
                  >
                    + Write Review
                  </button>
                </div>
              )}

              {/* Personal Notes */}
              {currentItem.notes && (
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
                    "{currentItem.notes}"
                  </div>
                </div>
              )}

              {/* Tags / Collections */}
              {currentItem.tags && currentItem.tags.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tags:</span>
                  {currentItem.tags.map((tag) => (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
