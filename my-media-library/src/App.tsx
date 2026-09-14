import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Games from './pages/Games';
import Movies from './pages/Movies';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import Timeline from './pages/Timeline';
import Collections from './pages/Collections';
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
              <div>
                Every game I play • Every movie I watch • One personal shelf
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </LibraryProvider>
  );
}

export default App;
