import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Games from './pages/Games';
import Movies from './pages/Movies';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import Timeline from './pages/Timeline';
import Collections from './pages/Collections';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { LogoIcon } from './components/Logo';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games" element={<Games />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/terms-and-conditions" element={<Terms />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            <footer className="app-footer">
              <div className="app-footer-inner">
                <div className="app-footer-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
                  <div
                    className="logo-badge"
                    style={{
                      width: '26px',
                      height: '26px',
                      minWidth: '26px',
                      minHeight: '26px',
                      borderRadius: '7px'
                    }}
                  >
                    <LogoIcon size={16} />
                  </div>
                  <span>
                    <strong style={{ color: 'var(--text-secondary)' }}>Vault &amp; Shelf</strong> — My Personal Gaming &amp; Movie Library
                  </span>
                </div>
                <div className="app-footer-links">
                  <span className="app-footer-tagline">Every game I play • Every movie I watch • One personal shelf</span>
                  <Link
                    to="/admin"
                    className="footer-btn-admin"
                    title="Administrative Security Center"
                  >
                    🛡️ Admin Vault
                  </Link>
                  <Link
                    to="/privacy"
                    className="footer-btn-privacy"
                    title="View Privacy Policy and data controls"
                  >
                    🔒 Privacy
                  </Link>
                  <Link
                    to="/terms"
                    className="footer-btn-terms"
                    title="View Terms & Conditions and usage rights"
                  >
                    📜 Terms
                  </Link>
                  <a
                    href="https://github.com/Iamrahulzax"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-btn-github"
                    title="View GitHub contributions"
                  >
                    <span className="footer-github-dot" />
                    GitHub: @Iamrahulzax
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
