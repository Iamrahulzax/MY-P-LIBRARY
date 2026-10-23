import React, { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { sanitizeInput, sanitizeUrl, sanitizeNumber, checkRateLimit } from '../utils/security';
import type { GameStatus, MovieStatus } from '../types';
import RealtimeMediaSearch from './RealtimeMediaSearch';
import type { GameSearchResult, MovieSearchResult } from '../services/realtimeSearch';
import { X, Plus, Gamepad2, Film, Search, Edit3, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'game' | 'movie';
}

const AddItemModalContent: React.FC<{ onClose: () => void; defaultType: 'game' | 'movie' }> = ({
  onClose,
  defaultType
}) => {
  const { addGame, addMovie } = useLibrary();

  // Mode: 'realtime' search or 'manual' form
  const [modalMode, setModalMode] = useState<'realtime' | 'manual'>('realtime');
  const [itemType, setItemType] = useState<'game' | 'movie'>(defaultType);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Common Form state (Manual)
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
  const [datePlayed, setDatePlayed] = useState(new Date().toISOString().split('T')[0]);

  // Movie specific
  const [director, setDirector] = useState('');
  const [movieStatus, setMovieStatus] = useState<MovieStatus>('Watched');
  const [dateWatched, setDateWatched] = useState(new Date().toISOString().split('T')[0]);

  // Custom tags
  const [tagsInput, setTagsInput] = useState('');

  const showNotification = (title: string) => {
    setToastMessage(`"${title}" added to your Vault!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectForEdit = (item: GameSearchResult | MovieSearchResult, type: 'game' | 'movie') => {
    setName(item.name);
    setCover(item.cover || '');
    setGenre(item.genre || '');
    setReleaseYear(item.releaseYear || new Date().getFullYear());
    setRating(item.rating || 9);
    setNotes(item.overview ? item.overview.slice(0, 300) : '');

    if (type === 'game') {
      const g = item as GameSearchResult;
      setItemType('game');
      setPlatform(g.platform || 'PC');
    } else {
      const m = item as MovieSearchResult;
      setItemType('movie');
      setDirector(m.director || 'Director');
    }

    setModalMode('manual');
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name, 120);
    if (!cleanName) return;

    // Rate limiting
    const rateCheck = checkRateLimit('add_media_item', 30, 60000);
    if (!rateCheck.allowed) {
      alert('Action throttled: You have reached the submission rate limit. Please wait a moment.');
      return;
    }

    const finalCover = sanitizeUrl(cover);
    const parsedTags = tagsInput
      .split(',')
      .map((t) => sanitizeInput(t, 40))
      .filter((t) => t.length > 0);
    const cleanGenre = sanitizeInput(genre, 60);
    const finalTags = parsedTags.length > 0 ? parsedTags : [cleanGenre || (itemType === 'game' ? 'Action' : 'Cinema')];

    if (itemType === 'game') {
      addGame({
        name: cleanName,
        cover: finalCover,
        platform: sanitizeInput(platform, 60) || 'PC',
        genre: cleanGenre || 'Action RPG',
        releaseYear: sanitizeNumber(releaseYear, 1970, 2100, new Date().getFullYear()),
        rating: sanitizeNumber(rating, 0, 10, 8),
        status: gameStatus,
        hoursPlayed: sanitizeNumber(hoursPlayed, 0, 100000, 0),
        datePlayed: gameStatus === 'Backlog' ? undefined : (sanitizeInput(datePlayed, 30) || new Date().toISOString().split('T')[0]),
        favorite,
        notes: sanitizeInput(notes, 1000, true),
        review: sanitizeInput(review, 2000, true),
        tags: finalTags
      });
    } else {
      addMovie({
        name: cleanName,
        cover: finalCover,
        genre: cleanGenre || 'Drama / Cinema',
        director: sanitizeInput(director, 100) || 'Director',
        releaseYear: sanitizeNumber(releaseYear, 1890, 2100, new Date().getFullYear()),
        rating: sanitizeNumber(rating, 0, 10, 8),
        status: movieStatus,
        dateWatched: movieStatus === 'Watchlist' ? undefined : (sanitizeInput(dateWatched, 30) || new Date().toISOString().split('T')[0]),
        favorite,
        notes: sanitizeInput(notes, 1000, true),
        review: sanitizeInput(review, 2000, true),
        tags: finalTags
      });
    }

    showNotification(cleanName);

    // Reset fields
    setName('');
    setCover('');
    setNotes('');
    setReview('');
    setTagsInput('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: modalMode === 'realtime' ? '860px' : '640px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="logo-badge" style={{ width: '36px', height: '36px' }}>
              <Plus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>Add to Media Vault</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Real-time online discovery or manual custom entry
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                type="button"
                onClick={() => setModalMode('realtime')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: modalMode === 'realtime' ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
                  color: modalMode === 'realtime' ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Search size={13} />
                <span>Real-Time Search</span>
              </button>

              <button
                type="button"
                onClick={() => setModalMode('manual')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: modalMode === 'manual' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: modalMode === 'manual' ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={13} />
                <span>Manual Form</span>
              </button>
            </div>

            <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Success Toast Notification */}
        {toastMessage && (
          <div style={{
            margin: '12px 24px 0 24px',
            padding: '10px 16px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Media Type Selector (Game vs Movie) */}
        <div style={{
          display: 'flex',
          padding: '14px 24px 0 24px',
          gap: '10px',
          flexShrink: 0
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
              padding: '10px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              background: itemType === 'game' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              border: itemType === 'game' ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
              color: itemType === 'game' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <Gamepad2 size={16} color={itemType === 'game' ? 'var(--primary-light)' : undefined} />
            <span>Games Section</span>
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
              padding: '10px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              background: itemType === 'movie' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              border: itemType === 'movie' ? '1px solid #c084fc' : '1px solid var(--border-subtle)',
              color: itemType === 'movie' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <Film size={16} color={itemType === 'movie' ? '#c084fc' : undefined} />
            <span>Movies Section</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '18px 24px 24px 24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {modalMode === 'realtime' ? (
            /* REAL-TIME SEARCH VIEW */
            <RealtimeMediaSearch
              type={itemType}
              onItemAdded={showNotification}
              onSelectForEdit={handleSelectForEdit}
              standalone={false}
            />
          ) : (
            /* MANUAL FORM VIEW */
            <form onSubmit={handleSubmitManual} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                      <option value="Playing">Playing</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Dropped">Dropped</option>
                      <option value="Backlog">Backlog</option>
                      <option value="Replaying">Replaying</option>
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
                      <option value="Watched">Watched</option>
                      <option value="Watchlist">Watchlist</option>
                      <option value="Favorite">Favorite</option>
                      <option value="Rewatch">Rewatch</option>
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
                    <label className="form-label">Date Watched {movieStatus === 'Watchlist' && '(Optional for Watchlist)'}</label>
                    <input
                      type="date"
                      value={dateWatched}
                      onChange={(e) => setDateWatched(e.target.value)}
                      disabled={movieStatus === 'Watchlist'}
                    />
                  </div>
                )}
              </div>

              {itemType === 'game' && gameStatus !== 'Backlog' && (
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
                <label className="form-label">Poster / Cover Image URL (optional)</label>
                <input
                  type="url"
                  placeholder="Paste image URL (leave empty for automatic resolution)"
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags / Collections (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Best Games, Must Play, Sci-Fi, Mind-Bending"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
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
                  rows={2}
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
                  Add to Favorites
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-add-item" style={{ padding: '10px 24px' }}>
                  <Plus size={16} />
                  Save to Vault
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const AddItemModal: React.FC<Props> = ({ isOpen, onClose, defaultType = 'game' }) => {
  if (!isOpen) return null;
  return <AddItemModalContent key={defaultType} onClose={onClose} defaultType={defaultType} />;
};

export default AddItemModal;
