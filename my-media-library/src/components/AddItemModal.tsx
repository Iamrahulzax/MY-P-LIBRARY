import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { GameStatus, MovieStatus } from '../types';
import { X, Plus, Gamepad2, Film } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'game' | 'movie';
}

const AddItemModal: React.FC<Props> = ({ isOpen, onClose, defaultType = 'game' }) => {
  const { addGame, addMovie } = useLibrary();
  const [itemType, setItemType] = useState<'game' | 'movie'>(defaultType);

  // Common Form state
  const [name, setName] = useState('');
  const [cover, setCover] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [rating, setRating] = useState<number>(9);
  const [favorite, setFavorite] = useState(false);
  const [notes, setNotes] = useState('');
  const [review, setReview] = useState('');

  // Game specific
  const [platform, setPlatform] = useState('PC');
  const [gameStatus, setGameStatus] = useState<GameStatus>('Playing');
  const [hoursPlayed, setHoursPlayed] = useState<number>(10);

  // Movie specific
  const [director, setDirector] = useState('');
  const [movieStatus, setMovieStatus] = useState<MovieStatus>('Watched');
  const [dateWatched, setDateWatched] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const defaultCover = itemType === 'game'
      ? 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=700&auto=format&fit=crop&q=80';

    const finalCover = cover.trim() || defaultCover;

    if (itemType === 'game') {
      addGame({
        name,
        cover: finalCover,
        platform,
        genre: genre || 'Action',
        releaseYear: Number(releaseYear) || 2024,
        rating: Number(rating) || 8,
        status: gameStatus,
        hoursPlayed: Number(hoursPlayed) || 0,
        datePlayed: new Date().toISOString().split('T')[0],
        favorite,
        notes,
        review,
        tags: [genre || 'General']
      });
    } else {
      addMovie({
        name,
        cover: finalCover,
        genre: genre || 'Drama',
        director: director || 'Director',
        releaseYear: Number(releaseYear) || 2024,
        rating: Number(rating) || 8,
        status: movieStatus,
        dateWatched,
        favorite,
        notes,
        review,
        tags: [genre || 'Cinema']
      });
    }

    // Reset and close
    setName('');
    setCover('');
    setNotes('');
    setReview('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 18px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="logo-badge" style={{ width: '36px', height: '36px' }}>
              <Plus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', margin: 0 }}>Add to My Shelf</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Catalog a new game or movie into your personal library
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <X size={16} />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div style={{
          display: 'flex',
          padding: '16px 28px 0 28px',
          gap: '12px'
        }}>
          <button
            type="button"
            onClick={() => setItemType('game')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '14px',
              background: itemType === 'game' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: itemType === 'game' ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
              color: itemType === 'game' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Gamepad2 size={18} color={itemType === 'game' ? 'var(--primary-light)' : undefined} />
            Add Game
          </button>

          <button
            type="button"
            onClick={() => setItemType('movie')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '14px',
              background: itemType === 'movie' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: itemType === 'movie' ? '1px solid #c084fc' : '1px solid var(--border-subtle)',
              color: itemType === 'movie' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Film size={18} color={itemType === 'movie' ? '#c084fc' : undefined} />
            Add Movie
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">{itemType === 'game' ? 'Game Title *' : 'Movie Title *'}</label>
            <input
              type="text"
              required
              placeholder={itemType === 'game' ? 'e.g. Elden Ring, Black Myth: Wukong' : 'e.g. Dune, Inception, Oppenheimer'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Genre</label>
              <input
                type="text"
                placeholder="e.g. Sci-Fi, RPG, Action"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Release Year</label>
              <input
                type="number"
                min="1970"
                max="2030"
                value={releaseYear}
                onChange={(e) => setReleaseYear(Number(e.target.value))}
              />
            </div>
          </div>

          {itemType === 'game' ? (
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option value="PC">PC</option>
                  <option value="PlayStation 5">PlayStation 5</option>
                  <option value="PlayStation 4">PlayStation 4</option>
                  <option value="Nintendo Switch">Nintendo Switch</option>
                  <option value="Xbox Series X">Xbox Series X</option>
                  <option value="Xbox One">Xbox One</option>
                  <option value="Steam Deck">Steam Deck</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={gameStatus} onChange={(e) => setGameStatus(e.target.value as GameStatus)}>
                  <option value="Playing">🔵 Playing</option>
                  <option value="Completed">✅ Completed</option>
                  <option value="On Hold">⏸️ On Hold</option>
                  <option value="Dropped">❌ Dropped</option>
                  <option value="Backlog">📚 Backlog</option>
                  <option value="Replaying">🔄 Replaying</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Director</label>
                <input
                  type="text"
                  placeholder="e.g. Christopher Nolan, Denis Villeneuve"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={movieStatus} onChange={(e) => setMovieStatus(e.target.value as MovieStatus)}>
                  <option value="Watched">👀 Watched</option>
                  <option value="Watchlist">📌 Watchlist</option>
                  <option value="Favorite">❤️ Favorite</option>
                  <option value="Rewatch">🔄 Rewatch</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Personal Rating (1-10)</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>{rating}/10 ⭐</span>
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

            {itemType === 'game' ? (
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

          <div className="form-group">
            <label className="form-label">Poster / Cover Image URL (optional)</label>
            <input
              type="url"
              placeholder="Paste image URL (leave empty for automatic placeholder)"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quick Personal Notes</label>
            <input
              type="text"
              placeholder="Brief memory, notable moment, or recommendation context"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Review</label>
            <textarea
              rows={3}
              placeholder="Your honest thoughts, what you loved or disliked..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="fav-check"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#f43f5e' }}
            />
            <label htmlFor="fav-check" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Add to ❤️ Favorites
            </label>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-add-item" style={{ padding: '10px 24px' }}>
              <Plus size={16} />
              Save to Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
