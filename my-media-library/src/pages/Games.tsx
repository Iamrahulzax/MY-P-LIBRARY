import React from 'react';
import gamesData from '../data/games.json';
import GameCard from '../components/GameCard';

const Games: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Games Collection</h1>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
      {gamesData.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  </div>
);

export default Games;
