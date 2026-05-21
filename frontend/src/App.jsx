import React, { useState, useCallback } from 'react';
import SearchInput from './components/SearchInput';
import Autocomplete from './components/Autocomplete';
import RecommendationList from './components/RecommendationList';
import RecentSearches from './components/RecentSearches';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Fetch autocomplete suggestions
  const handleSearchChange = useCallback(async (query) => {
    setSearchQuery(query);
    setError(null);

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/movies?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setSuggestions([]);
    }
  }, []);

  // Fetch recommendations
  const handleSelectMovie = useCallback(async (movieTitle) => {
    setSearchQuery(movieTitle);
    setSelectedMovie(movieTitle);
    setSuggestions([]);
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie_title: movieTitle })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch recommendations');
        setRecommendations([]);
      } else {
        setRecommendations(data.recommendations || []);
        
        // Add to recent searches
        setRecentSearches(prev => {
          const updated = [movieTitle, ...prev.filter(m => m !== movieTitle)].slice(0, 5);
          localStorage.setItem('recentSearches', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      setError('Error fetching recommendations: ' + err.message);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 Movie Recommender</h1>
        <p>Find movies similar to your favorites</p>
      </header>

      <main className="container">
        <div className="search-section">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a movie..."
          />
          
          {suggestions.length > 0 && (
            <Autocomplete
              suggestions={suggestions}
              onSelect={handleSelectMovie}
            />
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Finding similar movies...</p>
          </div>
        )}

        {recommendations.length > 0 && (
          <>
            <h2 className="results-title">
              Movies similar to <em>{selectedMovie}</em>
            </h2>
            <RecommendationList recommendations={recommendations} />
          </>
        )}

        {recentSearches.length > 0 && recommendations.length === 0 && !loading && (
          <RecentSearches
            searches={recentSearches}
            onSelect={handleSelectMovie}
            onClear={handleClearRecent}
          />
        )}
      </main>

      <footer className="footer">
        <p>Movie Recommender System • Powered by Content-Based Filtering</p>
      </footer>
    </div>
  );
}

export default App;
