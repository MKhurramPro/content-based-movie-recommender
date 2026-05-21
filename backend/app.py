from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
from difflib import get_close_matches

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load model artifacts
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

print("Loading model artifacts...")
with open(os.path.join(MODEL_DIR, 'vectorizer.pkl'), 'rb') as f:
    cv = pickle.load(f)

with open(os.path.join(MODEL_DIR, 'movies_df.pkl'), 'rb') as f:
    movies_df = pickle.load(f)

with open(os.path.join(MODEL_DIR, 'similarity_matrix.pkl'), 'rb') as f:
    similarity_matrix = pickle.load(f)

print(f"✓ Model loaded successfully!")
print(f"✓ Total movies in dataset: {len(movies_df)}")

# Create a list of all movie titles for autocomplete
all_movies = movies_df['title'].tolist()


@app.route('/api/movies', methods=['GET'])
def get_movies():
    """Autocomplete endpoint - returns movie suggestions based on query"""
    query = request.args.get('q', '').strip()
    
    if not query or len(query) < 2:
        return jsonify({'suggestions': []})
    
    # Case-insensitive matching
    query_lower = query.lower()
    matches = [movie for movie in all_movies if query_lower in movie.lower()]
    
    # Use fuzzy matching for typos
    if len(matches) == 0:
        matches = get_close_matches(query, all_movies, n=10, cutoff=0.6)
    
    # Limit to 10 suggestions
    suggestions = matches[:10]
    return jsonify({'suggestions': suggestions})


@app.route('/api/recommend', methods=['POST'])
def recommend():
    """Recommendation endpoint - returns 5 similar movies"""
    data = request.json
    movie_title = data.get('movie_title', '').strip()
    
    if not movie_title:
        return jsonify({'error': 'Movie title is required'}), 400
    
    # Find movie in dataframe (case-insensitive)
    matching_movies = movies_df[movies_df['title'].str.lower() == movie_title.lower()]
    
    if len(matching_movies) == 0:
        return jsonify({'error': f'Movie "{movie_title}" not found in database'}), 404
    
    # Get the index of the movie
    movie_index = matching_movies.index[0]
    
    # Get similarity scores for this movie
    similarity_scores = similarity_matrix[movie_index]
    
    # Get top 6 movies (excluding the movie itself at index 0)
    top_indices = similarity_scores.argsort()[::-1][1:6]
    
    # Build recommendation list with similarity scores
    recommendations = []
    for idx in top_indices:
        recommendations.append({
            'title': movies_df.iloc[idx]['title'],
            'similarity_score': float(similarity_scores[idx]),
            'similarity_percentage': round(float(similarity_scores[idx]) * 100, 1)
        })
    
    return jsonify({
        'search_movie': movie_title,
        'recommendations': recommendations
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'total_movies': len(movies_df),
        'model_status': 'loaded'
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
