import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Game, Movie } from '../types';
import { MediaPoster } from './MediaPoster/MediaPoster';
import {
  Sparkles,
  Dice5,
  Gamepad2,
  Film,
  Bookmark,
  Trophy,
  Clock,
  RefreshCw,
  Play,
  CheckCircle2,
  Heart,
  ArrowUpRight,
  Filter,
  Info
} from 'lucide-react';

interface Props {
  onSelectGame?: (game: Game) => void;
  onSelectMovie?: (movie: Movie) => void;
}

type MediaTypeFilter = 'all' | 'game' | 'movie';
type VibeFilter = 'backlog' | 'masterpiece' | 'quick' | 'replay' | 'any';
type ActiveTab = 'assistant' | 'queue';

interface CandidateItem {
  item: Game | Movie;
  type: 'game' | 'movie';
}

export const CollectionAssistant: React.FC<Props> = ({ onSelectGame, onSelectMovie }) => {
  const { games, movies, updateGame, updateMovie, toggleGameFavorite, toggleMovieFavorite } = useLibrary();

  const [activeTab, setActiveTab] = useState<ActiveTab>('assistant');
  const [mediaType, setMediaType] = useState<MediaTypeFilter>('all');
  const [vibeFilter, setVibeFilter] = useState<VibeFilter>('backlog');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [pickedResult, setPickedResult] = useState<CandidateItem | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Available unique genres across both collections
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    if (mediaType === 'all' || mediaType === 'game') {
      games.forEach((g) => g.genre.split('/').forEach((part) => set.add(part.trim())));
    }
    if (mediaType === 'all' || mediaType === 'movie') {
      movies.forEach((m) => m.genre.split('/').forEach((part) => set.add(part.trim())));
    }
    return Array.from(set).filter(Boolean).sort();
  }, [games, movies, mediaType]);

  // Filter candidate pool based on mediaType, vibeFilter, and genre
  const candidatePool = useMemo(() => {
    const list: CandidateItem[] = [];

    // Filter games
    if (mediaType === 'all' || mediaType === 'game') {
      games.forEach((g) => {
        let matchesVibe = true;
        if (vibeFilter === 'backlog') {
          matchesVibe = g.status === 'Backlog';
        } else if (vibeFilter === 'masterpiece') {
          matchesVibe = g.rating >= 9;
        } else if (vibeFilter === 'quick') {
          matchesVibe = Number(g.hoursPlayed) <= 15;
        } else if (vibeFilter === 'replay') {
          matchesVibe = g.status === 'Completed' || g.status === 'Replaying';
        }

        let matchesGenre = true;
        if (selectedGenre !== 'all') {
          matchesGenre = g.genre.toLowerCase().includes(selectedGenre.toLowerCase());
        }

        if (matchesVibe && matchesGenre) {
          list.push({ item: g, type: 'game' });
        }
      });
    }

    // Filter movies
    if (mediaType === 'all' || mediaType === 'movie') {
      movies.forEach((m) => {
        let matchesVibe = true;
        if (vibeFilter === 'backlog') {
          matchesVibe = m.status === 'Watchlist';
        } else if (vibeFilter === 'masterpiece') {
          matchesVibe = m.rating >= 9;
        } else if (vibeFilter === 'quick') {
          matchesVibe = true; // films are naturally quick sessions compared to games
        } else if (vibeFilter === 'replay') {
          matchesVibe = m.status === 'Watched' || m.status === 'Rewatch';
        }

        let matchesGenre = true;
        if (selectedGenre !== 'all') {
          matchesGenre = m.genre.toLowerCase().includes(selectedGenre.toLowerCase());
        }

        if (matchesVibe && matchesGenre) {
          list.push({ item: m, type: 'movie' });
        }
      });
    }

    return list;
  }, [games, movies, mediaType, vibeFilter, selectedGenre]);

  // Roll / Pick random item
  const handleRoll = () => {
    if (candidatePool.length === 0) {
      setPickedResult(null);
      setStatusMessage('No titles match the chosen filters. Try switching vibe or clearing the genre.');
      return;
    }

    setIsRolling(true);
    setStatusMessage(null);

    // Micro-animation delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * candidatePool.length);
      setPickedResult(candidatePool[randomIndex]);
      setIsRolling(false);
    }, 220);
  };

  // Quick 1-click status triggers
  const handleStartPlaying = (game: Game) => {
    const updated: Game = {
      ...game,
      status: 'Playing',
      datePlayed: new Date().toISOString().split('T')[0]
    };
    updateGame(updated);
    if (pickedResult && pickedResult.item.id === game.id) {
      setPickedResult({ item: updated, type: 'game' });
    }
    setStatusMessage(`"${game.name}" moved to Currently Playing!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleMarkWatched = (movie: Movie) => {
    const updated: Movie = {
      ...movie,
      status: 'Watched',
      dateWatched: new Date().toISOString().split('T')[0]
    };
    updateMovie(updated);
    if (pickedResult && pickedResult.item.id === movie.id) {
      setPickedResult({ item: updated, type: 'movie' });
    }
    setStatusMessage(`"${movie.name}" marked as Watched!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Backlog and Watchlist items for Queue view
  const backlogGames = useMemo(() => games.filter((g) => g.status === 'Backlog'), [games]);
  const watchlistMovies = useMemo(() => movies.filter((m) => m.status === 'Watchlist'), [movies]);

  return (
    <section id="collection-assistant" className="collection-assistant-card animate-fade-in">
      {/* Header */}
      <div className="assistant-header">
        <div className="assistant-header-text">
          <div className="chai-animated-badge">
            <span className="chai-badge-glint" aria-hidden="true" />
            <div className="chai-badge-inner">
              <Sparkles size={13} />
              <span>Collection Navigator</span>
            </div>
          </div>
          <h2 className="assistant-title">
            Smart decision helper: <span className="highlight">what to experience next</span>
          </h2>
          <p className="assistant-subtitle">
            Overcome decision paralysis. Filter your library by current mood, dive straight into your backlog queue,
            or let our randomizer pick your next session.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="assistant-tab-switcher">
          <button
            type="button"
            className={`assistant-tab-btn ${activeTab === 'assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('assistant')}
          >
            <Dice5 size={15} />
            <span>Pick For Me</span>
          </button>
          <button
            type="button"
            className={`assistant-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <Bookmark size={15} />
            <span>Up Next Queue</span>
            <span className="assistant-count-badge">
              {backlogGames.length + watchlistMovies.length}
            </span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="assistant-alert-banner" role="status">
          <Info size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tab 1: Decision Helper / Pick For Me */}
      {activeTab === 'assistant' && (
        <div className="assistant-body">
          {/* Controls Bar */}
          <div className="assistant-controls">
            {/* Media Type Selector */}
            <div className="assistant-control-group">
              <span className="control-label">Media Type</span>
              <div className="pill-group">
                <button
                  type="button"
                  className={`pill-btn ${mediaType === 'all' ? 'active' : ''}`}
                  onClick={() => setMediaType('all')}
                >
                  <Sparkles size={13} />
                  <span>All Media</span>
                </button>
                <button
                  type="button"
                  className={`pill-btn ${mediaType === 'game' ? 'active' : ''}`}
                  onClick={() => setMediaType('game')}
                >
                  <Gamepad2 size={13} />
                  <span>Games ({games.length})</span>
                </button>
                <button
                  type="button"
                  className={`pill-btn ${mediaType === 'movie' ? 'active' : ''}`}
                  onClick={() => setMediaType('movie')}
                >
                  <Film size={13} />
                  <span>Movies ({movies.length})</span>
                </button>
              </div>
            </div>

            {/* Vibe / Target Selector */}
            <div className="assistant-control-group">
              <span className="control-label">Current Vibe</span>
              <div className="pill-group">
                <button
                  type="button"
                  className={`pill-btn ${vibeFilter === 'backlog' ? 'active' : ''}`}
                  onClick={() => setVibeFilter('backlog')}
                  title="Unplayed backlog games and unwatched cinema"
                >
                  <Bookmark size={13} />
                  <span>Backlog / Queue</span>
                </button>
                <button
                  type="button"
                  className={`pill-btn ${vibeFilter === 'masterpiece' ? 'active' : ''}`}
                  onClick={() => setVibeFilter('masterpiece')}
                  title="Highest rated (9-10/10) comfort classics"
                >
                  <Trophy size={13} />
                  <span>Masterpieces (9-10)</span>
                </button>
                <button
                  type="button"
                  className={`pill-btn ${vibeFilter === 'quick' ? 'active' : ''}`}
                  onClick={() => setVibeFilter('quick')}
                  title="Short campaign or 2-hour movie"
                >
                  <Clock size={13} />
                  <span>Quick Sessions</span>
                </button>
                <button
                  type="button"
                  className={`pill-btn ${vibeFilter === 'replay' ? 'active' : ''}`}
                  onClick={() => setVibeFilter('replay')}
                  title="Replay favorite games or rewatch iconic films"
                >
                  <RefreshCw size={13} />
                  <span>Replay / Rewatch</span>
                </button>
                <button
                  type="button"
                  className={`pill-btn ${vibeFilter === 'any' ? 'active' : ''}`}
                  onClick={() => setVibeFilter('any')}
                  title="Any title in your entire collection"
                >
                  <Filter size={13} />
                  <span>Any in Library</span>
                </button>
              </div>
            </div>

            {/* Optional Genre Selector & Roll Action */}
            <div className="assistant-action-row">
              <div className="assistant-genre-wrap">
                <label htmlFor="assistant-genre-select" className="control-label">
                  Filter by Genre
                </label>
                <select
                  id="assistant-genre-select"
                  className="assistant-select"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  <option value="all">All Genres ({availableGenres.length})</option>
                  {availableGenres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="assistant-roll-wrap">
                <span className="candidate-count-text">
                  <strong>{candidatePool.length}</strong> matching candidates
                </span>
                <button
                  type="button"
                  className="btn-solid-asym assistant-roll-btn"
                  onClick={handleRoll}
                  disabled={isRolling || candidatePool.length === 0}
                >
                  <Dice5 size={17} className={isRolling ? 'spin-icon' : ''} />
                  <span>{isRolling ? 'Selecting...' : 'Pick For Me'}</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Result Card */}
          {pickedResult ? (
            <div className="assistant-spotlight-card animate-fade-in">
              <div className="spotlight-poster-col">
                <MediaPoster
                  title={pickedResult.item.name}
                  type={pickedResult.type}
                  year={pickedResult.item.releaseYear}
                  platform={pickedResult.type === 'game' ? (pickedResult.item as Game).platform : undefined}
                  customCover={pickedResult.item.cover}
                  aspectRatio="portrait"
                  className="spotlight-poster-img"
                />
              </div>

              <div className="spotlight-info-col">
                <div className="spotlight-meta-top">
                  <div className="spotlight-badges">
                    <span className="spotlight-type-badge">
                      {pickedResult.type === 'game' ? (
                        <>
                          <Gamepad2 size={12} /> Game
                        </>
                      ) : (
                        <>
                          <Film size={12} /> Movie
                        </>
                      )}
                    </span>
                    <span className={`status-badge status-badge-${pickedResult.item.status.toLowerCase().replace(/\s+/g, '')}`}>
                      {pickedResult.item.status}
                    </span>
                    <span className="spotlight-rating-badge">
                      ⭐ {pickedResult.item.rating}/10
                    </span>
                  </div>

                  <button
                    type="button"
                    className="spotlight-fav-btn"
                    title={pickedResult.item.favorite ? 'Remove favorite' : 'Add to favorites'}
                    onClick={() =>
                      pickedResult.type === 'game'
                        ? toggleGameFavorite(pickedResult.item.id)
                        : toggleMovieFavorite(pickedResult.item.id)
                    }
                  >
                    <Heart
                      size={17}
                      fill={pickedResult.item.favorite ? '#f43f5e' : 'none'}
                      color={pickedResult.item.favorite ? '#f43f5e' : 'var(--text-secondary)'}
                    />
                  </button>
                </div>

                <h3 className="spotlight-title">{pickedResult.item.name}</h3>

                <div className="spotlight-attributes">
                  <span className="attr-pill">{pickedResult.item.releaseYear}</span>
                  <span className="attr-pill">{pickedResult.item.genre}</span>
                  {pickedResult.type === 'game' ? (
                    <>
                      <span className="attr-pill">💻 {(pickedResult.item as Game).platform}</span>
                      <span className="attr-pill">⏱️ {(pickedResult.item as Game).hoursPlayed || 0}h logged</span>
                    </>
                  ) : (
                    <>
                      {(pickedResult.item as Movie).director && (
                        <span className="attr-pill">🎥 {(pickedResult.item as Movie).director}</span>
                      )}
                    </>
                  )}
                </div>

                {pickedResult.item.review ? (
                  <p className="spotlight-snippet">
                    <strong>Your Review:</strong> &ldquo;{pickedResult.item.review}&rdquo;
                  </p>
                ) : pickedResult.item.notes ? (
                  <p className="spotlight-snippet">
                    <strong>Notes:</strong> {pickedResult.item.notes}
                  </p>
                ) : (
                  <p className="spotlight-snippet-muted">
                    No personal notes recorded yet. Start this title and log your impressions!
                  </p>
                )}

                {/* Spotlight Actions */}
                <div className="spotlight-actions">
                  {pickedResult.type === 'game' && pickedResult.item.status !== 'Playing' && (
                    <button
                      type="button"
                      className="btn-solid-asym"
                      onClick={() => handleStartPlaying(pickedResult.item as Game)}
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Start Playing</span>
                    </button>
                  )}

                  {pickedResult.type === 'movie' && pickedResult.item.status !== 'Watched' && (
                    <button
                      type="button"
                      className="btn-solid-asym"
                      onClick={() => handleMarkWatched(pickedResult.item as Movie)}
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark as Watched</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-outline-asym"
                    onClick={() => {
                      if (pickedResult.type === 'game' && onSelectGame) {
                        onSelectGame(pickedResult.item as Game);
                      } else if (pickedResult.type === 'movie' && onSelectMovie) {
                        onSelectMovie(pickedResult.item as Movie);
                      }
                    }}
                  >
                    <span>View Full Entry</span>
                    <ArrowUpRight size={14} />
                  </button>

                  <button
                    type="button"
                    className="btn-outline-asym"
                    onClick={handleRoll}
                    title="Pick another matching title"
                  >
                    <Dice5 size={14} />
                    <span>Roll Another</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="assistant-empty-prompt">
              <div className="prompt-icon-wrap">
                <Dice5 size={28} />
              </div>
              <h4>Ready to pick your next title?</h4>
              <p>
                Choose your media preference and mood above, then click <strong>&quot;Pick For Me&quot;</strong> to get an instant recommendation from your personal library.
              </p>
              <button
                type="button"
                className="btn-solid-asym"
                style={{ marginTop: '14px' }}
                onClick={handleRoll}
              >
                <Dice5 size={16} />
                <span>Roll a Title Now</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Queue / Up Next Overview */}
      {activeTab === 'queue' && (
        <div className="assistant-queue-body animate-fade-in">
          <div className="queue-dual-grid">
            {/* Games Backlog */}
            <div className="queue-column">
              <div className="queue-col-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gamepad2 size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>
                    Games in Backlog ({backlogGames.length})
                  </h3>
                </div>
                <span className="queue-col-badge">Priority Queue</span>
              </div>

              {backlogGames.length === 0 ? (
                <div className="queue-empty-box">
                  <Bookmark size={20} />
                  <span>No games currently in backlog! Add new games with status &quot;Backlog&quot;.</span>
                </div>
              ) : (
                <div className="queue-items-list">
                  {backlogGames.slice(0, 4).map((game) => (
                    <div
                      key={game.id}
                      className="queue-item-row"
                      onClick={() => onSelectGame && onSelectGame(game)}
                    >
                      <div className="queue-item-thumb">
                        <MediaPoster
                          title={game.name}
                          type="game"
                          year={game.releaseYear}
                          platform={game.platform}
                          customCover={game.cover}
                          aspectRatio="portrait"
                          className="queue-thumb-img"
                        />
                      </div>
                      <div className="queue-item-details">
                        <div className="queue-item-title">{game.name}</div>
                        <div className="queue-item-meta">
                          {game.releaseYear} • {game.genre} • {game.platform}
                        </div>
                        <div className="queue-item-rating">
                          ⭐ {game.rating}/10
                        </div>
                      </div>
                      <button
                        type="button"
                        className="queue-advance-btn"
                        title="Start playing now"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartPlaying(game);
                        }}
                      >
                        <Play size={13} fill="currentColor" />
                        <span>Play</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Movies Watchlist */}
            <div className="queue-column">
              <div className="queue-col-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Film size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>
                    Movies on Watchlist ({watchlistMovies.length})
                  </h3>
                </div>
                <span className="queue-col-badge">Cinema Queue</span>
              </div>

              {watchlistMovies.length === 0 ? (
                <div className="queue-empty-box">
                  <Film size={20} />
                  <span>No films on watchlist! Add films with status &quot;Watchlist&quot;.</span>
                </div>
              ) : (
                <div className="queue-items-list">
                  {watchlistMovies.slice(0, 4).map((movie) => (
                    <div
                      key={movie.id}
                      className="queue-item-row"
                      onClick={() => onSelectMovie && onSelectMovie(movie)}
                    >
                      <div className="queue-item-thumb">
                        <MediaPoster
                          title={movie.name}
                          type="movie"
                          year={movie.releaseYear}
                          customCover={movie.cover}
                          aspectRatio="portrait"
                          className="queue-thumb-img"
                        />
                      </div>
                      <div className="queue-item-details">
                        <div className="queue-item-title">{movie.name}</div>
                        <div className="queue-item-meta">
                          {movie.releaseYear} • {movie.genre} {movie.director ? `• ${movie.director}` : ''}
                        </div>
                        <div className="queue-item-rating">
                          ⭐ {movie.rating}/10
                        </div>
                      </div>
                      <button
                        type="button"
                        className="queue-advance-btn"
                        title="Mark watched"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkWatched(movie);
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Watch</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CollectionAssistant;
