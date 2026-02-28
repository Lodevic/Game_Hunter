from flask import request, session, jsonify
from sqlalchemy import text
from backend import db
from backend.models.game import query_games, format_game_row, SELECT_COLS, GENRE_SECTIONS


# ════════════════════════════
#  LANDING PAGE (publik)
# ════════════════════════════

def api_bg_images():
    try:
        rows = db.session.execute(text("""
            SELECT image_url FROM best_selling_games
            WHERE image_url IS NOT NULL AND image_url != ''
            ORDER BY RAND() LIMIT 50
        """)).fetchall()
        return jsonify({'images': [r.image_url for r in rows]})
    except Exception:
        return jsonify({'images': []})


def api_popular_games():
    try:
        rows = db.session.execute(text(
            f"{SELECT_COLS} ORDER BY all_reviews_number DESC LIMIT 10"
        )).fetchall()
        return jsonify({'games': [format_game_row(r) for r in rows]})
    except Exception:
        return jsonify({'games': []})


# ════════════════════════════
#  REKOMENDASI & SEARCH
# ════════════════════════════

def api_rekomendasi():
    sections = []
    for g in GENRE_SECTIONS:
        conds = ' OR '.join([f"user_defined_tags LIKE '%{kw}%'" for kw in g['keywords']])
        games = query_games(f"{SELECT_COLS} WHERE {conds} ORDER BY all_reviews_number DESC LIMIT 25")
        if games:
            sections.append({'label': g['label'], 'badge': g['badge'], 'games': games})
    return jsonify({'sections': sections})


def api_search():
    keyword = request.args.get('q', '').strip()
    results = query_games(
        f"{SELECT_COLS} WHERE game_name LIKE :kw ORDER BY rating DESC LIMIT 50",
        {'kw': f'%{keyword}%'}
    ) if keyword else []
    return jsonify({'results': results, 'keyword': keyword})


def api_tags():
    try:
        rows = db.session.execute(text(
            "SELECT user_defined_tags, other_features FROM best_selling_games WHERE user_defined_tags IS NOT NULL"
        )).fetchall()
        genres, fiturs = set(), set()
        for row in rows:
            if row.user_defined_tags:
                for tag in row.user_defined_tags.split(','):
                    t = tag.strip()
                    if t: genres.add(t)
            if row.other_features:
                for f in row.other_features.split(','):
                    f = f.strip()
                    if f: fiturs.add(f)
        return jsonify({'genres': sorted(list(genres)), 'fiturs': sorted(list(fiturs))})
    except Exception:
        return jsonify({'genres': [], 'fiturs': []})


def api_recommend():
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np

    data   = request.get_json() or {}
    genres = data.get('genres', [])
    fiturs = data.get('fiturs', [])

    if not genres and not fiturs:
        return jsonify({'error': 'Pilih minimal 1 genre atau fitur!'}), 400

    try:
        rows = db.session.execute(text(
            f"{SELECT_COLS} WHERE user_defined_tags IS NOT NULL"
        )).fetchall()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    if not rows:
        return jsonify({'results': []})

    game_docs  = [
        (row.user_defined_tags or '').replace(',', ' ') + ' ' +
        (row.other_features or '').replace(',', ' ')
        for row in rows
    ]
    user_query   = ' '.join(genres + fiturs)
    all_docs     = game_docs + [user_query]
    vectorizer   = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(all_docs)
    scores       = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1]).flatten()
    top_indices  = scores.argsort()[::-1][:20]

    results = []
    for idx in top_indices:
        if scores[idx] == 0:
            continue
        results.append({
            **format_game_row(rows[idx]),
            'similarity_score': round(float(scores[idx]), 4)
        })
    return jsonify({'results': results, 'query': {'genres': genres, 'fiturs': fiturs}})


# ════════════════════════════
#  FAVORIT
# ════════════════════════════

def api_favorit():
    user_id = session['user_id']
    rows = db.session.execute(text("""
        SELECT b.id, b.game_name, b.developer, b.release_date, b.price,
               b.rating, b.age_restriction, b.supported_os,
               b.user_defined_tags, b.other_features, b.image_url
        FROM user_favorites f
        JOIN best_selling_games b ON f.game_id = b.id
        WHERE f.user_id = :u ORDER BY f.created_at DESC
    """), {'u': user_id}).fetchall()
    return jsonify({'games': [format_game_row(r) for r in rows]})


def api_favorit_list():
    user_id = session['user_id']
    rows = db.session.execute(
        text("SELECT game_id FROM user_favorites WHERE user_id=:u"),
        {'u': user_id}
    ).fetchall()
    return jsonify({'favorites': [r.game_id for r in rows]})


def api_favorit_toggle():
    game_id = (request.get_json() or {}).get('game_id')
    user_id = session['user_id']
    if not game_id:
        return jsonify({'error': 'no game_id'}), 400
    existing = db.session.execute(
        text("SELECT id FROM user_favorites WHERE user_id=:u AND game_id=:g"),
        {'u': user_id, 'g': game_id}
    ).fetchone()
    if existing:
        db.session.execute(
            text("DELETE FROM user_favorites WHERE user_id=:u AND game_id=:g"),
            {'u': user_id, 'g': game_id}
        )
    else:
        db.session.execute(
            text("INSERT INTO user_favorites (user_id, game_id) VALUES (:u, :g)"),
            {'u': user_id, 'g': game_id}
        )
    db.session.commit()
    return jsonify({'status': 'removed' if existing else 'added'})