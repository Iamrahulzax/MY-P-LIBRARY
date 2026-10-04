import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Games from './pages/Games';
import Movies from './pages/Movies';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import Timeline from './pages/Timeline';
import Collections from './pages/Collections';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './App.css';

function App() {
  return (
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
            </Routes>
          </main>

          <footer style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '28px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
            background: 'rgba(7, 9, 14, 0.9)'
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Vault & Shelf</strong> — My Personal Gaming & Movie Library
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span>Every game I play • Every movie I watch • One personal shelf</span>
                <Link
                  to="/privacy"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#818cf8',
                    textDecoration: 'none',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}
                  title="View Privacy Policy and data controls"
                >
                  🛡️ Privacy Policy
                </Link>
                <a
                  href="https://github.com/Iamrahulzax"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#4ade80',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                  title="View GitHub contributions"
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)' }} />
                  GitHub: @Iamrahulzax
                </a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </LibraryProvider>
  );
}

export default App;
