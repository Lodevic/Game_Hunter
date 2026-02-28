from flask import jsonify
from backend.models.game import query_games, SELECT_COLS


def api_dashboard():
    return jsonify({
        'top_rating':    query_games(f"{SELECT_COLS} ORDER BY rating DESC LIMIT 25"),
        'most_reviewed': query_games(f"{SELECT_COLS} ORDER BY all_reviews_number DESC LIMIT 25"),
        'most_liked':    query_games(f"{SELECT_COLS} ORDER BY reviews_like_rate DESC LIMIT 25"),
        'free_games':    query_games(f"{SELECT_COLS} WHERE price = 0 ORDER BY rating DESC LIMIT 25"),
        'easy_games':    query_games(f"{SELECT_COLS} WHERE difficulty = 1 ORDER BY rating DESC LIMIT 25"),
    })