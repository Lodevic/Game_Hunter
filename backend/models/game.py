from sqlalchemy import text
from backend import db

# ════════════════════════════
#  KONSTANTA
# ════════════════════════════
SELECT_COLS = """SELECT id, game_name, developer, release_date, price, rating,
               age_restriction, supported_os, user_defined_tags, other_features,
               image_url, steam_app_id FROM best_selling_games"""

GENRE_SECTIONS = [
    {'key': 'action',     'label': 'ACTION GAMES',         'badge': 'ACTION',      'keywords': ['Action', 'Fighting']},
    {'key': 'fps',        'label': 'FIRST-PERSON SHOOTER', 'badge': 'FPS',         'keywords': ['FPS', 'Shooter', 'Tactical']},
    {'key': 'rpg',        'label': 'ROLE-PLAYING GAMES',   'badge': 'RPG',         'keywords': ['RPG', 'Role-Playing', 'JRPG']},
    {'key': 'strategy',   'label': 'STRATEGY GAMES',       'badge': 'STRATEGY',    'keywords': ['Strategy', 'Turn-Based', 'RTS']},
    {'key': 'sports',     'label': 'SPORTS GAMES',         'badge': 'SPORTS',      'keywords': ['Sports', 'Football', 'Basketball']},
    {'key': 'racing',     'label': 'RACING GAMES',         'badge': 'RACING',      'keywords': ['Racing', 'Driving', 'Cars']},
    {'key': 'simulation', 'label': 'SIMULATION GAMES',     'badge': 'SIMULATION',  'keywords': ['Simulation', 'Simulator', 'Management']},
    {'key': 'openworld',  'label': 'SANDBOX / OPEN WORLD', 'badge': 'OPEN WORLD',  'keywords': ['Open World', 'Sandbox']},
    {'key': 'survival',   'label': 'SURVIVAL GAMES',       'badge': 'SURVIVAL',    'keywords': ['Survival', 'Crafting', 'Zombie']},
    {'key': 'horror',     'label': 'HORROR GAMES',         'badge': 'HORROR',      'keywords': ['Horror', 'Psychological']},
]

# ════════════════════════════
#  HELPERS
# ════════════════════════════
def format_game_row(row):
    try:
        harga = f"${float(row.price):.2f}" if row.price and float(row.price) > 0 else 'Free to Play'
    except Exception:
        harga = 'Free to Play'

    try:
        rating_raw = float(row.rating) if row.rating else 0.0
        rating_str = f"{rating_raw:.1f} / 5"
    except Exception:
        rating_raw = 0.0
        rating_str = '-'

    try:
        steam_app_id = int(row.steam_app_id) if row.steam_app_id else None
    except Exception:
        steam_app_id = None

    return {
        'id':           row.id,
        'name':         row.game_name or '-',
        'developer':    row.developer or '-',
        'release':      str(row.release_date) if row.release_date else '-',
        'price':        harga,
        'rating':       rating_str,
        'rating_raw':   rating_raw,
        'usia':         row.age_restriction or '-',
        'platform':     row.supported_os or 'Windows (PC)',
        'genre':        row.user_defined_tags or '-',
        'fitur':        row.other_features or '-',
        'image':        row.image_url or '',
        'steam_app_id': steam_app_id,
    }

def query_games(sql, params=None):
    try:
        rows = db.session.execute(text(sql), params or {}).fetchall()
        return [format_game_row(r) for r in rows]
    except Exception as e:
        print(f"[DB ERROR] {e}")
        return []