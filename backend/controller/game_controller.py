from flask import render_template, request, session, jsonify
from app.model.game import (
    get_games_by_genre_section,
    search_games,
    get_user_favorites,
    get_favorite_ids,
    toggle_favorite,
)


def rekomendasi_page():
    """GET /rekomendasi — game rekomendasi per genre."""
    sections = get_games_by_genre_section(limit=25)
    return render_template('rekomendasi_populer.html',
        active_page='rekomendasi',
        sections=sections,
    )


def search_page():
    """GET /search — halaman pencarian game."""
    keyword = request.args.get('q', '').strip()
    results = search_games(keyword) if keyword else []
    return render_template('search.html',
        active_page='search',
        keyword=keyword,
        results=results,
    )


def favorit_page():
    """GET /favorit — tampilkan semua game favorit user."""
    user_id   = session['user_id']
    fav_games = get_user_favorites(user_id)
    fav_ids   = [g['id'] for g in fav_games]
    return render_template('favorit.html',
        active_page='favorit',
        fav_games=fav_games,
        fav_ids=fav_ids,
    )


def favorit_toggle_api():
    """POST /favorit/toggle — toggle favorit via AJAX, return JSON."""
    game_id = request.json.get('game_id')
    user_id = session['user_id']
    if not game_id:
        return jsonify({'error': 'no game_id'}), 400
    status = toggle_favorite(user_id, game_id)
    return jsonify({'status': status})


def favorit_list_api():
    """GET /favorit/list — return list game_id favorit user sebagai JSON."""
    user_id = session['user_id']
    ids = get_favorite_ids(user_id)
    return jsonify({'favorites': ids})