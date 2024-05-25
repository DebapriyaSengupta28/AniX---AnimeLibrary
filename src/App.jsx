import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EntryPage from './pages/EntryPage';
import HomePage from './pages/HomePage';
import WatchList from './pages/watchList';
import AnimeDetail from './pages/AnimeDetail';
import TrendingPage from './pages/TrendingPage';
import SearchPage from './pages/SearchPage'; // Import SearchPage component

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<EntryPage />} />
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/WatchList" element={<WatchList />} />
          <Route path="/anime/:animeId" element={<AnimeDetail />} />
          <Route path="/Trending" element={<TrendingPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
