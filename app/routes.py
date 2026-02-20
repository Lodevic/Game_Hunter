from flask import render_template, request, redirect, url_for, session
from app import app, db
from app.model.user import User
from sqlalchemy import text
import requests

# ── RAWG API KEY — daftar gratis di https://rawg.io/apidocs ──
RAWG_API_KEY = 'MASUKKAN_API_KEY_KAMU_DISINI'

# ── MAPPING genre keyword → label di dashboard ──
GENRE_MAP = [
    {'label': 'Horror Game Rekomendasi',   'keywords': ['Horror', 'Survival Horror']},
    {'label': 'Action Game Rekomendasi',   'keywords': ['Action', 'Action RPG', 'Hack and Slash']},
    {'label': 'Sports Game Rekomendasi',   'keywords': ['Sports', 'Football', 'Racing', 'Basketball']},
    {'label': 'Strategy Game Rekomendasi', 'keywords': ['Strategy', 'MOBA', 'Turn-Based', '4X']},
]

# ── DECORATOR: wajib login ──
def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated


# ── AMBIL GAMBAR DARI RAWG API ──
def get_game_image(game_name):
    try:
        res = requests.get(
            'https://api.rawg.io/api/games',
            params={'key': RAWG_API_KEY, 'search': game_name, 'page_size': 1},
            timeout=5
        )
        data = res.json()
        if data.get('results'):
            return data['results'][0].get('background_image', None)
    except Exception:
        pass
    return None


# ── AMBIL GAME PER GENRE DARI DB ──
def get_games_by_genre(keywords, limit=5):
    conditions = ' OR '.join([f"user_defined_tags LIKE :kw{i}" for i, _ in enumerate(keywords)])
    params     = {f'kw{i}': f'%{kw}%' for i, kw in enumerate(keywords)}

    query = text(f"""
        SELECT id, game_name, developer, release_date, price, rating,
               age_restriction, supported_os, user_defined_tags, other_features
        FROM best_selling_games
        WHERE {conditions}
        ORDER BY rating DESC
        LIMIT {limit}
    """)

    rows  = db.session.execute(query, params).fetchall()
    games = []
    for row in rows:
        image_url = get_game_image(row.game_name)
        games.append({
            'id':        row.id,
            'name':      row.game_name,
            'developer': row.developer or '-',
            'release':   str(row.release_date) if row.release_date else '-',
            'price':     f"${row.price:.2f}" if row.price and row.price > 0 else 'Free to Play',
            'rating':    f"{row.rating:.1f} / 5" if row.rating else '-',
            'usia':      row.age_restriction or '-',
            'platform':  row.supported_os or 'Windows (PC)',
            'genre':     row.user_defined_tags or '-',
            'fitur':     row.other_features or '-',
            'image':     image_url,
        })
    return games


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
    # Ambil game per genre dari DB + gambar dari RAWG API
    genre_sections = []
    for g in GENRE_MAP:
        games = get_games_by_genre(g['keywords'], limit=5)
        if games:
            genre_sections.append({'label': g['label'], 'games': games})

    return render_template('dashboard.html',
                           active_page='dashboard',
                           user_name=session.get('user_name', 'User'),
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