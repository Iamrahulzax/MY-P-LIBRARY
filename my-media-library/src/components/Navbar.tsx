import React, { useState, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { preventPrototypePollution } from '../utils/security';
import {
  Gamepad2,
  Film,
  Heart,
  Bookmark,
  History,
  FolderKanban,
  Plus,
  LayoutDashboard,
  RotateCcw,
  Download,
  Upload,
  Menu,
  X,
  ShieldCheck,
  KeyRound,
  FileText
} from 'lucide-react';
import AddItemModal from './AddItemModal';
import ProfileModal from './ProfileModal';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const { games, movies, stats, profile, resetToDefault, exportLibrary, importLibrary } = useLibrary();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReset = () => {
    if (!isAdmin) {
      if (window.confirm('Administrator privileges are required to perform a library reset. Would you like to log in as Admin?')) {
        navigate('/login');
      }
      return;
    }
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
    if (!isAdmin) {
      if (window.confirm('Administrator privileges are required to import external backup files. Would you like to log in as Admin?')) {
        navigate('/login');
      }
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedRaw = JSON.parse(text);
        const safeData = preventPrototypePollution(parsedRaw);
        if (safeData && (Array.isArray(safeData.games) || Array.isArray(safeData.movies))) {
          const success = importLibrary(safeData);
          if (success) {
            alert(`Library restored successfully! Loaded ${safeData.games?.length || 0} games and ${safeData.movies?.length || 0} movies.`);
          }
        } else {
          alert('Invalid backup file format. Expected JSON with games and/or movies arrays.');
        }
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  // Close mobile drawer on Escape and lock body scrolling when open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeMobile();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Logo Brand */}
          <Link to="/" className="brand-logo" onClick={closeMobile} aria-label="Vault & Shelf - Home">
            <Logo size="md" />
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
            {/* Admin Security Status Badge */}
            {isAdmin ? (
              <Link
                to="/admin"
                className="navbar-auth-pill"
                title="Admin session active — Click to open Security Center"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(0, 255, 136, 0.12)',
                  border: '1px solid rgba(0, 255, 136, 0.35)',
                  color: '#00ff88',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <ShieldCheck size={15} />
                <span>Admin</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="navbar-auth-pill"
                title="Guest Mode — Click to authenticate as Admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <KeyRound size={14} />
                <span>Login</span>
              </Link>
            )}

            {/* Profile Avatar & Selector Button */}
            <button
              type="button"
              className="navbar-profile-btn"
              onClick={() => setIsProfileModalOpen(true)}
              title={`Profile: ${profile.name} — Click to customize`}
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
              aria-label="Add Item"
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
              title={isAdmin ? "Import / Restore library JSON" : "Admin required to import"}
            >
              <Upload size={15} />
            </button>

            <button
              type="button"
              className="btn-secondary nav-action-icon"
              onClick={handleReset}
              title={isAdmin ? "Reset to default library data" : "Admin required to reset"}
            >
              <RotateCcw size={15} />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="btn-secondary mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Toggle mobile menu"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Backdrop & Navigation Drawer */}
        {isMobileMenuOpen && (
          <>
            <div
              className="mobile-drawer-overlay animate-fade-in"
              onClick={closeMobile}
              aria-label="Close mobile menu overlay"
            />
            <div className="mobile-nav-drawer animate-fade-in" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
              {/* Mobile Drawer Header */}
              <div className="mobile-drawer-top-header">
                <div className="mobile-drawer-brand">
                  <Logo size="sm" showTagline={false} />
                </div>
                <button
                  type="button"
                  className="mobile-drawer-close-btn"
                  onClick={closeMobile}
                  aria-label="Close mobile navigation"
                >
                  <X size={18} />
                </button>
              </div>
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

            {/* Mobile Auth Button */}
            <div style={{ padding: '0 4px 10px' }}>
              {isAdmin ? (
                <Link
                  to="/admin"
                  onClick={closeMobile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(0, 255, 136, 0.12)',
                    border: '1px solid rgba(0, 255, 136, 0.35)',
                    color: '#00ff88',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '13.5px'
                  }}
                >
                  <ShieldCheck size={16} /> Admin Command Center Active
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontSize: '13.5px'
                  }}
                >
                  <KeyRound size={16} /> Authenticate as Admin
                </Link>
              )}
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
            <NavLink to="/privacy" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <ShieldCheck size={18} />
              <span>Privacy Policy</span>
            </NavLink>
            <NavLink to="/terms" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <FileText size={18} />
              <span>Terms & Conditions</span>
            </NavLink>

            {/* Quick Actions in Mobile Drawer */}
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '14px 4px 6px 4px',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '8px'
            }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { closeMobile(); handleExport(); }}
                style={{ flex: 1, fontSize: '13px', justifyContent: 'center', padding: '9px 10px' }}
                title="Backup Library JSON"
              >
                <Download size={15} /> <span>Backup</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { closeMobile(); handleImportClick(); }}
                style={{ flex: 1, fontSize: '13px', justifyContent: 'center', padding: '9px 10px' }}
                title="Restore Library JSON"
              >
                <Upload size={15} /> <span>Restore</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { closeMobile(); handleReset(); }}
                style={{ fontSize: '13px', padding: '9px 14px' }}
                title="Reset Library Defaults"
              >
                <RotateCcw size={15} />
              </button>
            </div>
            </div>
          </>
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
