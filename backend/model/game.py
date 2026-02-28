from app import db
from sqlalchemy import text


SELECT_COLS = """
    SELECT id, game_name, developer, release_date, price, rating,
           age_restriction, supported_os, user_defined_tags, other_features,
           image_url
    FROM best_selling_games
"""

GENRE_SECTIONS = [
    {'key': 'action',     'label': '⚔️ ACTION GAMES',          'badge': 'ACTION',      'keywords': ['Action', 'Fighting']},
    {'key': 'fps',        'label': '🔫 FIRST-PERSON SHOOTER',   'badge': 'FPS',         'keywords': ['FPS', 'Shooter', 'Tactical']},
    {'key': 'rpg',        'label': '🧙 ROLE-PLAYING GAMES',     'badge': 'RPG',         'keywords': ['RPG', 'Role-Playing', 'JRPG']},
    {'key': 'strategy',   'label': '♟️ STRATEGY GAMES',         'badge': 'STRATEGY',    'keywords': ['Strategy', 'Turn-Based', 'RTS']},
    {'key': 'sports',     'label': '⚽ SPORTS GAMES',           'badge': 'SPORTS',      'keywords': ['Sports', 'Football', 'Basketball']},
    {'key': 'racing',     'label': '🏎️ RACING GAMES',           'badge': 'RACING',      'keywords': ['Racing', 'Driving', 'Cars']},
    {'key': 'simulation', 'label': '🏙️ SIMULATION GAMES',      'badge': 'SIMULATION',  'keywords': ['Simulation', 'Simulator', 'Management']},
    {'key': 'openworld',  'label': '🌍 SANDBOX / OPEN WORLD',   'badge': 'OPEN WORLD',  'keywords': ['Open World', 'Sandbox']},
    {'key': 'survival',   'label': '🪓 SURVIVAL GAMES',         'badge': 'SURVIVAL',    'keywords': ['Survival', 'Crafting', 'Zombie']},
    {'key': 'horror',     'label': '👻 HORROR GAMES',           'badge': 'HORROR',      'keywords': ['Horror', 'Psychological', 'Survival Horror']},
]


# ════════════════════════════
#  HELPER
# ════════════════════════════

def format_game_row(row):
    """Convert DB row → dict siap pakai di template."""
    try:
        harga = f"${float(row.price):.2f}" if row.price and float(row.price) > 0 else 'Free to Play'
    except Exception:
        harga = 'Free to Play'
    try:
        rating_str = f"{float(row.rating):.1f} / 5" if row.rating else '-'
    except Exception:
        rating_str = '-'

    return {
        'id':        row.id,
        'name':      row.game_name or '-',
        'developer': row.developer or '-',
        'release':   str(row.release_date) if row.release_date else '-',
        'price':     harga,
        'rating':    rating_str,
        'usia':      row.age_restriction or '-',
        'platform':  row.supported_os or 'Windows (PC)',
        'genre':     row.user_defined_tags or '-',
        'fitur':     row.other_features or '-',
        'image':     row.image_url or '',
    }


def _query(sql, params=None):
    """Helper eksekusi query dan return list dict."""
    try:
        rows = db.session.execute(text(sql), params or {}).fetchall()
        return [format_game_row(r) for r in rows]
    except Exception as e:
        print(f"[DB ERROR] {e}")
        return []


# ════════════════════════════
#  DASHBOARD QUERIES
# ════════════════════════════

def get_popular_games(limit=20):
    return _query(f"{SELECT_COLS} WHERE id BETWEEN 1 AND 20 ORDER BY id ASC LIMIT {limit}")

def get_top_rating(limit=25):
    return _query(f"{SELECT_COLS} ORDER BY rating DESC LIMIT {limit}")

def get_most_reviewed(limit=25):
    return _query(f"{SELECT_COLS} ORDER BY all_reviews_number DESC LIMIT {limit}")

def get_most_liked(limit=25):
    return _query(f"{SELECT_COLS} ORDER BY reviews_like_rate DESC LIMIT {limit}")

def get_free_games(limit=25):
    return _query(f"{SELECT_COLS} WHERE price = 0 ORDER BY rating DESC LIMIT {limit}")

def get_easy_games(limit=25):
    return _query(f"{SELECT_COLS} WHERE difficulty = 1 ORDER BY rating DESC LIMIT {limit}")


# ════════════════════════════
#  REKOMENDASI QUERIES
# ════════════════════════════

def get_games_by_genre_section(limit=25):
    """Return list section untuk halaman rekomendasi."""
    sections = []
    for g in GENRE_SECTIONS:
        conds = ' OR '.join([f"user_defined_tags LIKE '%{kw}%'" for kw in g['keywords']])
        games = _query(
            f"{SELECT_COLS} WHERE {conds} "
            f"ORDER BY all_reviews_number DESC LIMIT {limit}"
        )
        if games:
            sections.append({'label': g['label'], 'badge': g['badge'], 'games': games})
    return sections


# ════════════════════════════
#  SEARCH QUERY
# ════════════════════════════

def search_games(keyword, limit=50):
    """Cari game berdasarkan nama."""
    return _query(
        f"{SELECT_COLS} WHERE game_name LIKE :kw ORDER BY rating DESC LIMIT {limit}",
        {'kw': f'%{keyword}%'}
    )


# ════════════════════════════
#  FAVORIT QUERIES
# ════════════════════════════

def get_user_favorites(user_id):
    """Ambil semua game favorit user dari DB."""
    try:
        rows = db.session.execute(text("""
            SELECT b.id, b.game_name, b.developer, b.release_date, b.price,
                   b.rating, b.age_restriction, b.supported_os,
                   b.user_defined_tags, b.other_features, b.image_url
            FROM user_favorites f
            JOIN best_selling_games b ON f.game_id = b.id
            WHERE f.user_id = :u
            ORDER BY f.created_at DESC
        """), {'u': user_id}).fetchall()
        return [format_game_row(r) for r in rows]
    except Exception as e:
        print(f"[DB FAVORIT ERROR] {e}")
        return []


def get_favorite_ids(user_id):
    """Ambil list game_id yang difavoritkan user."""
    try:
        rows = db.session.execute(
            text("SELECT game_id FROM user_favorites WHERE user_id=:u"),
            {'u': user_id}
        ).fetchall()
        return [r.game_id for r in rows]
    except Exception as e:
        print(f"[DB FAV IDS ERROR] {e}")
        return []


def toggle_favorite(user_id, game_id):
    """Toggle favorit — return 'added' atau 'removed'."""
    existing = db.session.execute(
        text("SELECT id FROM user_favorites WHERE user_id=:u AND game_id=:g"),
        {'u': user_id, 'g': game_id}
    ).fetchone()
    if existing:
        db.session.execute(
            text("DELETE FROM user_favorites WHERE user_id=:u AND game_id=:g"),
            {'u': user_id, 'g': game_id}
        )
        db.session.commit()
        return 'removed'
    else:
        db.session.execute(
            text("INSERT INTO user_favorites (user_id, game_id) VALUES (:u, :g)"),
            {'u': user_id, 'g': game_id}
        )
        db.session.commit()
        return 'added'


# ════════════════════════════
#  BACKGROUND LOGIN
# ════════════════════════════

def get_random_bg_images(count=50):
    """Ambil gambar random dari DB untuk background login/register."""
    try:
        rows = db.session.execute(text("""
            SELECT image_url FROM best_selling_games
            WHERE image_url IS NOT NULL AND image_url != ''
            ORDER BY RAND()
            LIMIT :count
        """), {'count': count}).fetchall()
        return [row.image_url for row in rows]
    except Exception as e:
        print(f"[BG ERROR] {e}")
        return []