import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Game, Movie } from '../types';
import GameCard from '../components/GameCard';
import MovieCard from '../components/MovieCard';
import DetailModal from '../components/DetailModal';
import { FolderKanban, Flame, Ghost, Globe, Trophy, RefreshCw, Rocket, Brain, Heart } from 'lucide-react';

interface CollectionDef {
  id: string;
  name: string;
  type: 'game' | 'movie';
  icon: React.ReactNode;
  tag: string;
  description: string;
  gradient: string;
}

const COLLECTIONS: CollectionDef[] = [
  // Games
  {
    id: 'g-best',
    name: 'Best Games',
    type: 'game',
    icon: <Trophy size={20} color="#fbbf24" />,
    tag: 'Best Games',
    description: 'The pinnacle of interactive gaming — top-tier storytelling and gameplay.',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },
  {
    id: 'g-must',
    name: 'Must Play',
    type: 'game',
    icon: <Flame size={20} color="#f97316" />,
    tag: 'Must Play',
    description: 'Essential experiences that every gamer should witness at least once.',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },
  {
    id: 'g-horror',
    name: 'Horror Games',
    type: 'game',
    icon: <Ghost size={20} color="#a855f7" />,
    tag: 'Horror Games',
    description: 'Spine-chilling atmospheres, psychological dread, and survival mechanics.',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },
  {
    id: 'g-openworld',
    name: 'Open World',
    type: 'game',
    icon: <Globe size={20} color="#38bdf8" />,
    tag: 'Open World',
    description: 'Vast, sprawling lands to explore with boundless freedom and secrets.',
    gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },
  {
    id: 'g-completed',
    name: 'Completed',
    type: 'game',
    icon: <Trophy size={20} color="#10b981" />,
    tag: 'Completed',
    description: 'Games finished from beginning to the end credits with pride.',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },
  {
    id: 'g-replay',
    name: 'Games to Replay',
    type: 'game',
    icon: <RefreshCw size={20} color="#06b6d4" />,
    tag: 'Games to Replay',
    description: 'Titles so extraordinary they warrant a second or third playthrough.',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },

  // Movies
  {
    id: 'm-favorite',
    name: 'Favorite Movies',
    type: 'movie',
    icon: <Heart size={20} color="#f43f5e" />,
    tag: 'Favorite Movies',
    description: 'The personal cinematic hall of fame with indelible emotional resonance.',
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },
  {
    id: 'm-must',
    name: 'Must Watch',
    type: 'movie',
    icon: <Flame size={20} color="#f59e0b" />,
    tag: 'Must Watch',
    description: 'Cinematic milestones with iconic directing, acting, and score.',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },
  {
    id: 'm-scifi',
    name: 'Sci-Fi',
    type: 'movie',
    icon: <Rocket size={20} color="#818cf8" />,
    tag: 'Sci-Fi',
    description: 'Deep cosmic voyages, futuristic societies, and mind-expanding concepts.',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },
  {
    id: 'm-mind',
    name: 'Mind-Bending',
    type: 'movie',
    icon: <Brain size={20} color="#c084fc" />,
    tag: 'Mind-Bending',
    description: 'Complex narratives, non-linear timelines, and twist endings that puzzle the brain.',
    gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },
  {
    id: 'm-rewatch',
    name: 'Rewatch',
    type: 'movie',
    icon: <RefreshCw size={20} color="#22d3ee" />,
    tag: 'Rewatch',
    description: 'Films that get better every time you revisit them with friends or alone.',
    gradient: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  },
  {
    id: 'm-horror',
    name: 'Horror',
    type: 'movie',
    icon: <Ghost size={20} color="#ef4444" />,
    tag: 'Horror',
    description: 'Chilling cinema made for late nights and pure adrenaline thrills.',
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(18, 24, 36, 0.9) 100%)'
  }
];

const Collections: React.FC = () => {
  const { games, movies } = useLibrary();
  const [activeCollection, setActiveCollection] = useState<CollectionDef>(COLLECTIONS[0]);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const matchedGames = games.filter((g) => {
    if (activeCollection.type !== 'game') return false;
    if (activeCollection.tag === 'Completed') return g.status === 'Completed';
    return g.tags?.includes(activeCollection.tag) || g.genre.toLowerCase().includes(activeCollection.tag.toLowerCase());
  });

  const matchedMovies = movies.filter((m) => {
    if (activeCollection.type !== 'movie') return false;
    if (activeCollection.tag === 'Rewatch') return m.status === 'Rewatch' || m.tags?.includes('Rewatch');
    return m.tags?.includes(activeCollection.tag) || m.genre.toLowerCase().includes(activeCollection.tag.toLowerCase());
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <FolderKanban size={36} color="var(--primary-light)" />
            <span>Curated Collections</span>
          </h1>
          <p className="page-subtitle">
            Thematic personal collections from your README — pick a mood or theme to explore.
          </p>
        </div>
      </div>

      {/* Collection Boxes Grid */}
      <div className="collections-grid" style={{ marginBottom: '36px' }}>
        {COLLECTIONS.map((col) => {
          const isSelected = activeCollection.id === col.id;
          return (
            <div
              key={col.id}
              className="collection-box"
              onClick={() => setActiveCollection(col)}
              style={{
                background: isSelected ? col.gradient : undefined,
                borderColor: isSelected ? 'var(--primary-light)' : undefined,
                boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.25)' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {col.icon}
                  <h3 style={{ fontSize: '18px', margin: 0 }}>{col.name}</h3>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: col.type === 'game' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                  color: col.type === 'game' ? 'var(--primary-light)' : '#c084fc'
                }}>
                  {col.type}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {col.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Collection View */}
      <section style={{
        background: 'var(--bg-card)',
        padding: '28px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Viewing Curated Shelf:
            </span>
            <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              {activeCollection.icon}
              {activeCollection.name}
            </h2>
          </div>
          <span className="stat-chip">
            <strong>{activeCollection.type === 'game' ? matchedGames.length : matchedMovies.length}</strong> items in collection
          </span>
        </div>

        {activeCollection.type === 'game' ? (
          matchedGames.length > 0 ? (
            <div className="cards-grid">
              {matchedGames.map((game) => (
                <GameCard key={game.id} game={game} onSelect={setSelectedGame} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px' }}>
              <p>No games currently tagged in this collection.</p>
            </div>
          )
        ) : (
          matchedMovies.length > 0 ? (
            <div className="movies-grid">
              {matchedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={setSelectedMovie} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px' }}>
              <p>No movies currently tagged in this collection.</p>
            </div>
          )
        )}
      </section>

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

export default Collections;
