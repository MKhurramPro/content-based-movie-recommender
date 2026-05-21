import React from 'react';

function RecommendationList({ recommendations }) {
  return (
    <div className="recommendations-container">
      {recommendations.map((movie, index) => (
        <div key={index} className="recommendation-card">
          <div className="rank">{index + 1}</div>
          <div className="movie-info">
            <h3 className="movie-title">{movie.title}</h3>
            <div className="similarity-score">
              <div className="score-label">Similarity</div>
              <div className="score-value">{movie.similarity_percentage}%</div>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{ width: `${movie.similarity_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RecommendationList;
