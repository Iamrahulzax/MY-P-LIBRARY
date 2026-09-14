import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { Gamepad2, Film, Heart, Bookmark, History, FolderKanban, Plus, LayoutDashboard, Sparkles, RotateCcw } from 'lucide-react';
import AddItemModal from './AddItemModal';

const Navbar: React.FC = () => {
  const { games, movies, stats, resetToDefault } = useLibrary();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset your library back to the original sample collection? Any newly added items will be refreshed.')) {
      resetToDefault();
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Logo Brand */}
          <Link to="/" className="brand-logo">
            <div className="logo-badge">
              <Sparkles size={20} />
            </div>
            <div className="brand-text-wrapper">
              <span className="brand-name">Vault & Shelf</span>
              <span className="brand-tagline">My Personal Media Library</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink to="/" end className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/games" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  <Gamepad2 size={16} />
                  <span>Games</span>
                  <span className="nav-pill-count">{games.length}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/movies" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  <Film size={16} />
                  <span>Movies</span>
                  <span className="nav-pill-count">{movies.length}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/favorites" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  <Heart size={16} />
                  <span>Favorites</span>
                  {stats.favoritesCount > 0 && (
                    <span className="nav-pill-count" style={{ background: 'rgba(244, 63, 94, 0.25)', color: '#fb7185' }}>
                      {stats.favoritesCount}
                    </span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink to="/watchlist" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  <Bookmark size={16} />
                  <span>Backlog</span>
                  {(stats.backlogCount + stats.watchlistCount) > 0 && (
                    <span className="nav-pill-count" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
                      {stats.backlogCount + stats.watchlistCount}
                    </span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink to="/timeline" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  <History size={16} />
                  <span>Timeline</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/collections" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  <FolderKanban size={16} />
                  <span>Collections</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            <button
              type="button"
              className="btn-add-item"
              onClick={() => setIsAddModalOpen(true)}
              title="Add a game or movie to your library"
            >
              <Plus size={16} />
              <span>Add Item</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              title="Reset to default library data"
              style={{ padding: '8px 12px', color: 'var(--text-muted)' }}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
