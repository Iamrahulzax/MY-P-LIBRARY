import React, { useState, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import {
  Gamepad2,
  Film,
  Heart,
  Bookmark,
  History,
  FolderKanban,
  Plus,
  LayoutDashboard,
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  Menu,
  X
} from 'lucide-react';
import AddItemModal from './AddItemModal';
import ProfileModal from './ProfileModal';

const Navbar: React.FC = () => {
  const { games, movies, stats, profile, resetToDefault, exportLibrary, importLibrary } = useLibrary();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReset = () => {
    if (window.confirm('Reset your library back to the original sample collection? Any custom added items will be restored to defaults.')) {
      resetToDefault();
    }
  };

  const handleExport = () => {
    const data = exportLibrary();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-shelf-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && (Array.isArray(parsed.games) || Array.isArray(parsed.movies))) {
          const success = importLibrary(parsed);
          if (success) {
            alert(`Library restored successfully! Loaded ${parsed.games?.length || 0} games and ${parsed.movies?.length || 0} movies.`);
          }
        } else {
          alert('Invalid backup file format. Expected JSON with games and/or movies arrays.');
        }
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Logo Brand */}
          <Link to="/" className="brand-logo" onClick={closeMobile}>
            <div className="logo-badge">
              <Sparkles size={20} />
            </div>
            <div className="brand-text-wrapper">
              <span className="brand-name">Vault & Shelf</span>
              <span className="brand-tagline">My Personal Media Library</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
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
            {/* Profile Avatar & Selector Button */}
            <button
              type="button"
              className="navbar-profile-btn"
              onClick={() => setIsProfileModalOpen(true)}
              title={`Logged in as ${profile.name} — Click to customize profile & avatar`}
            >
              <div className="navbar-profile-avatar-wrap">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="navbar-profile-avatar-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/cat-dev.jpg';
                  }}
                />
                <span className="navbar-profile-status-dot" />
              </div>
              <div className="navbar-profile-text-wrap">
                <span className="navbar-profile-name">{profile.name}</span>
                <span className="navbar-profile-tagline">{profile.tagline || 'Collector'}</span>
              </div>
            </button>

            <button
              type="button"
              className="btn-add-item"
              onClick={() => setIsAddModalOpen(true)}
              title="Add a game or movie to your library"
            >
              <Plus size={16} />
              <span className="btn-add-text">Add Item</span>
            </button>

            <button
              type="button"
              className="btn-secondary nav-action-icon"
              onClick={handleExport}
              title="Backup / Export library JSON"
            >
              <Download size={15} />
            </button>

            <button
              type="button"
              className="btn-secondary nav-action-icon"
              onClick={handleImportClick}
              title="Import / Restore library JSON"
            >
              <Upload size={15} />
            </button>

            <button
              type="button"
              className="btn-secondary nav-action-icon"
              onClick={handleReset}
              title="Reset to default library data"
            >
              <RotateCcw size={15} />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="btn-secondary mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-drawer animate-fade-in">
            {/* Mobile Profile Card */}
            <div
              className="mobile-profile-card"
              onClick={() => {
                closeMobile();
                setIsProfileModalOpen(true);
              }}
            >
              <div className="navbar-profile-avatar-wrap">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="navbar-profile-avatar-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/cat-dev.jpg';
                  }}
                />
                <span className="navbar-profile-status-dot" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc' }}>{profile.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {profile.tagline || 'Collector'}
                </div>
              </div>
              <span className="btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }}>
                Edit
              </span>
            </div>
            <NavLink to="/" end className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/games" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <Gamepad2 size={18} />
              <span>Games</span>
              <span className="nav-pill-count">{games.length}</span>
            </NavLink>
            <NavLink to="/movies" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <Film size={18} />
              <span>Movies</span>
              <span className="nav-pill-count">{movies.length}</span>
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <Heart size={18} />
              <span>Favorites</span>
              <span className="nav-pill-count" style={{ background: 'rgba(244, 63, 94, 0.25)', color: '#fb7185' }}>
                {stats.favoritesCount}
              </span>
            </NavLink>
            <NavLink to="/watchlist" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <Bookmark size={18} />
              <span>Backlog & Watchlist</span>
              <span className="nav-pill-count" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
                {stats.backlogCount + stats.watchlistCount}
              </span>
            </NavLink>
            <NavLink to="/timeline" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <History size={18} />
              <span>Timeline History</span>
            </NavLink>
            <NavLink to="/collections" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <FolderKanban size={18} />
              <span>Curated Collections</span>
            </NavLink>
          </div>
        )}
      </header>

      {/* Hidden File Input for Library Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Profile Selection Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
