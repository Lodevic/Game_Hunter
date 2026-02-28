from flask import render_template, session
from app.model.game import (
    get_popular_games, get_top_rating, get_most_reviewed,
    get_most_liked, get_free_games, get_easy_games
)


def dashboard_page():
    """GET /dashboard — halaman utama setelah login."""
    return render_template('dashboard.html',
        active_page  = 'dashboard',
        user_name    = session.get('user_name', 'User'),
        popular_games= get_popular_games(20),
        top_rating   = get_top_rating(25),
        most_reviewed= get_most_reviewed(25),
        most_liked   = get_most_liked(25),
        free_games   = get_free_games(25),
        easy_games   = get_easy_games(25),
    )