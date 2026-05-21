import React from 'react';

function RecentSearches({ searches, onSelect, onClear }) {
  return (
    <div className="recent-searches">
      <div className="recent-header">
        <h3>Recent Searches</h3>
        <button className="clear-button" onClick={onClear}>
          Clear History
        </button>
      </div>
      <div className="recent-tags">
        {searches.map((movie, index) => (
          <button
            key={index}
            className="recent-tag"
            onClick={() => onSelect(movie)}
          >
            {movie}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RecentSearches;
