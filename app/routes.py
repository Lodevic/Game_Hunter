from flask import render_template, request, redirect, url_for, session
from app import app, db
from app.model.user import User
from sqlalchemy import text
import requests

RAWG_API_KEY = '8d72c45a17f746309288d44c79608066'

GENRE_MAP = [
    {'label': 'Horror Game Rekomendasi',   'keywords': ['Horror', 'Survival']},
    {'label': 'Action Game Rekomendasi',   'keywords': ['Action', 'FPS', 'Tactical']},
    {'label': 'Sports Game Rekomendasi',   'keywords': ['Sports', 'Football', 'Racing', 'Basketball']},
    {'label': 'Strategy Game Rekomendasi', 'keywords': ['Strategy', 'MOBA', 'Turn-Based', 'RPG']},
]

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated


# ════════════════════════════════════════════
#  CACHE SYSTEM
#  - Kalau image_url di DB sudah ada → pakai langsung (cepat!)
#  - Kalau image_url kosong → fetch dari RAWG API → simpan ke DB
# ════════════════════════════════════════════

def fetch_from_rawg(game_name):
    """Ambil gambar dari RAWG API."""
    try:
        res = requests.get(
            'https://api.rawg.io/api/games',
            params={
                'key': RAWG_API_KEY,
                'search': game_name,
                'page_size': 1,
                'search_precise': True
            },
            timeout=5
        )
        if res.status_code == 200:
            results = res.json().get('results', [])
            if results:
                return results[0].get('background_image') or ''
    except Exception as e:
        print(f"[RAWG ERROR] {game_name}: {e}")
    return ''


def get_game_image_cached(game_id, game_name, cached_url):
    """
    Ambil gambar dengan cache:
    - Kalau cached_url sudah ada di DB → return langsung
    - Kalau kosong → fetch RAWG API → simpan ke DB → return
    """
    if cached_url:
        return cached_url  # ← Sudah ada di cache, langsung pakai!

    # Belum ada cache → fetch dari API
    image_url = fetch_from_rawg(game_name)

    # Simpan ke DB supaya next time tidak perlu fetch lagi
    try:
        db.session.execute(
            text("UPDATE best_selling_games SET image_url = :url WHERE id = :id"),
            {'url': image_url, 'id': game_id}
        )
        db.session.commit()
        print(f"[CACHE SAVED] {game_name}")
    except Exception as e:
        print(f"[CACHE ERROR] {e}")

    return image_url


def format_game_row(row):
    """Convert DB row ke dict game dengan cache system."""
    try:
        harga = f"${float(row.price):.2f}" if row.price and float(row.price) > 0 else 'Free to Play'
    except Exception:
        harga = 'Free to Play'
    try:
        rating_str = f"{float(row.rating):.1f} / 5" if row.rating else '-'
    except Exception:
        rating_str = '-'

    # Pakai cache — kalau sudah ada langsung pakai, kalau belum fetch API
    image_url = get_game_image_cached(row.id, row.game_name, row.image_url)

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
        'image':     image_url,
    }


def get_popular_games(limit=20):
    """Ambil game paling populer berdasarkan rating tertinggi."""
    query = text(f"""
        SELECT id, game_name, developer, release_date, price, rating,
               age_restriction, supported_os, user_defined_tags, other_features,
               image_url
        FROM best_selling_games
        WHERE id BETWEEN 1 AND 20
        ORDER BY id ASC
    """)
    try:
        rows = db.session.execute(query).fetchall()
        return [format_game_row(r) for r in rows]
    except Exception as e:
        print(f"[DB ERROR popular] {e}")
        return []


def get_games_by_genre(keywords, limit=20):
    """Query best_selling_games berdasarkan keyword di user_defined_tags."""
    if not keywords:
        return []
    conditions = ' OR '.join([f"user_defined_tags LIKE :kw{i}" for i, _ in enumerate(keywords)])
    params     = {f'kw{i}': f'%{kw}%' for i, kw in enumerate(keywords)}
    query = text(f"""
        SELECT id, game_name, developer, release_date, price, rating,
               age_restriction, supported_os, user_defined_tags, other_features,
               image_url
        FROM best_selling_games
        WHERE {conditions}
        ORDER BY rating DESC
        LIMIT {limit}
    """)
    try:
        rows = db.session.execute(query, params).fetchall()
        return [format_game_row(r) for r in rows]
    except Exception as e:
        print(f"[DB ERROR genre] {e}")
        return []


# ════════════════════════════
#  HALAMAN PUBLIK
# ════════════════════════════

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    error = None
    if request.method == 'POST':
        email    = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        if not email or not password:
            error = 'Email dan password wajib diisi.'
        else:
            user = User.query.filter_by(email=email).first()
            if user and user.check_password(password):
                session['user_id']   = user.id
                session['user_name'] = user.name
                return redirect(url_for('dashboard'))
            else:
                error = 'Email atau password salah.'
    return render_template('login.html', error=error)


@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    error = None
    if request.method == 'POST':
        name     = request.form.get('name', '').strip()
        email    = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        confirm  = request.form.get('confirm_password', '').strip()
        if not name or not email or not password or not confirm:
            error = 'Semua field wajib diisi.'
        elif len(password) < 6:
            error = 'Password minimal 6 karakter.'
        elif password != confirm:
            error = 'Password dan konfirmasi tidak cocok.'
        elif User.query.filter_by(email=email).first():
            error = 'Email sudah terdaftar.'
        else:
            new_user = User(name=name, email=email)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()
            session['user_id']   = new_user.id
            session['user_name'] = new_user.name
            return redirect(url_for('dashboard'))
    return render_template('register.html', error=error)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


# ════════════════════════════
#  HALAMAN YANG BUTUH LOGIN
# ════════════════════════════

@app.route('/dashboard')
@login_required
def dashboard():
    popular_games  = get_popular_games(limit=20)
    genre_sections = []
    for g in GENRE_MAP:
        games = get_games_by_genre(g['keywords'], limit=20)
        if games:
            genre_sections.append({'label': g['label'], 'games': games})

    return render_template('dashboard.html',
                           active_page='dashboard',
                           user_name=session.get('user_name', 'User'),
                           popular_games=popular_games,
                           genre_sections=genre_sections)


@app.route('/rekomendasi')
@login_required
def rekomendasi():
    return render_template('rekomendasi_populer.html', active_page='rekomendasi')


@app.route('/search')
@login_required
def search():
    return render_template('search.html', active_page='search')


@app.route('/favorit')
@login_required
def favorit():
    return render_template('favorit.html', active_page='favorit')


@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html',
                           active_page='profile',
                           user_name=session.get('user_name', 'User'))