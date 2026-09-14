import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Games from './pages/Games';
import Movies from './pages/Movies';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container" style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/movies" element={<Movies />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
