import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => (
  <nav style={{ padding: '1rem', background: '#1a1a1a', color: '#fff' }}>
    <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', margin: 0, padding: 0 }}>
      <li><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link></li>
      <li><Link to="/games" style={{ color: '#fff', textDecoration: 'none' }}>Games</Link></li>
      <li><Link to="/movies" style={{ color: '#fff', textDecoration: 'none' }}>Movies</Link></li>
    </ul>
  </nav>
);

export default Navbar;
