from flask import render_template, request, redirect, url_for, session, jsonify
from app import app, db
from app.model.user import User
from sqlalchemy import text

# ════════════════════════════
#  HELPERS
# ════════════════════════════

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            # Kalau request dari React (JSON), return 401
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized'}), 401
            return redirect(url_for('login_page'))
        return f(*args, **kwargs)
    return decorated


def format_game_row(row):
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


def query_games(sql, params=None):
    try:
        rows = db.session.execute(text(sql), params or {}).fetchall()
        return [format_game_row(r) for r in rows]
    except Exception as e:
        print(f"[DB ERROR] {e}")
        return []


SELECT_COLS = """SELECT id, game_name, developer, release_date, price, rating,
               age_restriction, supported_os, user_defined_tags, other_features,
               image_url FROM best_selling_games"""

GENRE_SECTIONS = [
    {'key': 'action',     'label': '⚔️ ACTION GAMES',         'badge': 'ACTION',      'keywords': ['Action', 'Fighting']},
    {'key': 'fps',        'label': '🔫 FIRST-PERSON SHOOTER',  'badge': 'FPS',         'keywords': ['FPS', 'Shooter', 'Tactical']},
    {'key': 'rpg',        'label': '🧙 ROLE-PLAYING GAMES',    'badge': 'RPG',         'keywords': ['RPG', 'Role-Playing', 'JRPG']},
    {'key': 'strategy',   'label': '♟️ STRATEGY GAMES',        'badge': 'STRATEGY',    'keywords': ['Strategy', 'Turn-Based', 'RTS']},
    {'key': 'sports',     'label': '⚽ SPORTS GAMES',          'badge': 'SPORTS',      'keywords': ['Sports', 'Football', 'Basketball']},
    {'key': 'racing',     'label': '🏎️ RACING GAMES',          'badge': 'RACING',      'keywords': ['Racing', 'Driving', 'Cars']},
    {'key': 'simulation', 'label': '🏙️ SIMULATION GAMES',     'badge': 'SIMULATION',  'keywords': ['Simulation', 'Simulator', 'Management']},
    {'key': 'openworld',  'label': '🌍 SANDBOX / OPEN WORLD',  'badge': 'OPEN WORLD',  'keywords': ['Open World', 'Sandbox']},
    {'key': 'survival',   'label': '🪓 SURVIVAL GAMES',        'badge': 'SURVIVAL',    'keywords': ['Survival', 'Crafting', 'Zombie']},
    {'key': 'horror',     'label': '👻 HORROR GAMES',          'badge': 'HORROR',      'keywords': ['Horror', 'Psychological']},
]


# ════════════════════════════════════════
#  API ROUTES — untuk React frontend
# ════════════════════════════════════════

@app.route('/api/me')
def api_me():
    if 'user_id' not in session:
        return jsonify({'logged_in': False}), 200
    return jsonify({
        'logged_in': True,
        'user_id':   session['user_id'],
        'user_name': session.get('user_name', ''),
    })


@app.route('/api/login', methods=['POST'])
def api_login():
    data     = request.get_json() or {}
    email    = (data.get('email') or '').strip()
    password = (data.get('password') or '').strip()
    if not email or not password:
        return jsonify({'error': 'Email dan password wajib diisi.'}), 400
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        session['user_id']   = user.id
        session['user_name'] = user.name
        return jsonify({'success': True, 'user_name': user.name})
    return jsonify({'error': 'Email atau password salah.'}), 401


@app.route('/api/register', methods=['POST'])
def api_register():
    data    = request.get_json() or {}
    name    = (data.get('name') or '').strip()
    email   = (data.get('email') or '').strip()
    password= (data.get('password') or '').strip()
    confirm = (data.get('confirm_password') or '').strip()
    if not all([name, email, password, confirm]):
        return jsonify({'error': 'Semua field wajib diisi.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password minimal 6 karakter.'}), 400
    if password != confirm:
        return jsonify({'error': 'Password tidak cocok.'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email sudah terdaftar.'}), 400
    new_user = User(name=name, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    session['user_id']   = new_user.id
    session['user_name'] = new_user.name
    return jsonify({'success': True, 'user_name': new_user.name})


@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})


@app.route('/api/dashboard')
@login_required
def api_dashboard():
    return jsonify({
        'top_rating':    query_games(f"{SELECT_COLS} ORDER BY rating DESC LIMIT 25"),
        'most_reviewed': query_games(f"{SELECT_COLS} ORDER BY all_reviews_number DESC LIMIT 25"),
        'most_liked':    query_games(f"{SELECT_COLS} ORDER BY reviews_like_rate DESC LIMIT 25"),
        'free_games':    query_games(f"{SELECT_COLS} WHERE price = 0 ORDER BY rating DESC LIMIT 25"),
        'easy_games':    query_games(f"{SELECT_COLS} WHERE difficulty = 1 ORDER BY rating DESC LIMIT 25"),
    })


@app.route('/api/rekomendasi')
@login_required
def api_rekomendasi():
    sections = []
    for g in GENRE_SECTIONS:
        conds = ' OR '.join([f"user_defined_tags LIKE '%{kw}%'" for kw in g['keywords']])
        games = query_games(f"{SELECT_COLS} WHERE {conds} ORDER BY all_reviews_number DESC LIMIT 25")
        if games:
            sections.append({'label': g['label'], 'badge': g['badge'], 'games': games})
    return jsonify({'sections': sections})


@app.route('/api/search')
@login_required
def api_search():
    keyword = request.args.get('q', '').strip()
    results = query_games(f"{SELECT_COLS} WHERE game_name LIKE :kw ORDER BY rating DESC LIMIT 50",
                          {'kw': f'%{keyword}%'}) if keyword else []
    return jsonify({'results': results, 'keyword': keyword})


@app.route('/api/favorit')
@login_required
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


@app.route('/api/favorit/list')
@login_required
def api_favorit_list():
    user_id = session['user_id']
    rows = db.session.execute(
        text("SELECT game_id FROM user_favorites WHERE user_id=:u"),
        {'u': user_id}
    ).fetchall()
    return jsonify({'favorites': [r.game_id for r in rows]})


@app.route('/api/favorit/toggle', methods=['POST'])
@login_required
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
        db.session.execute(text("DELETE FROM user_favorites WHERE user_id=:u AND game_id=:g"), {'u': user_id, 'g': game_id})
        db.session.commit()
        return jsonify({'status': 'removed'})
    db.session.execute(text("INSERT INTO user_favorites (user_id, game_id) VALUES (:u, :g)"), {'u': user_id, 'g': game_id})
    db.session.commit()
    return jsonify({'status': 'added'})


@app.route('/api/profile')
@login_required
def api_profile():
    return jsonify({'user_name': session.get('user_name', ''), 'user_id': session.get('user_id')})


@app.route('/api/bg-images')
def api_bg_images():
    try:
        rows = db.session.execute(text("""
            SELECT image_url FROM best_selling_games
            WHERE image_url IS NOT NULL AND image_url != ''
            ORDER BY RAND() LIMIT 50
        """)).fetchall()
        return jsonify({'images': [r.image_url for r in rows]})
    except Exception as e:
        return jsonify({'images': []})

@app.route('/api/tags')
def api_tags():
    try:
        rows = db.session.execute(text(
            "SELECT user_defined_tags, other_features FROM best_selling_games WHERE user_defined_tags IS NOT NULL"
        )).fetchall()
        
        genres = set()
        fiturs = set()
        
        for row in rows:
            if row.user_defined_tags:
                for tag in row.user_defined_tags.split(','):
                    t = tag.strip()
                    if t: genres.add(t)
            if row.other_features:
                for f in row.other_features.split(','):
                    f = f.strip()
                    if f: fiturs.add(f)
        
        return jsonify({
            'genres': sorted(list(genres)),
            'fiturs': sorted(list(fiturs))
        })
    except Exception as e:
        return jsonify({'genres': [], 'fiturs': []})    

# Tambahkan ke app/routes.py

@app.route('/api/recommend', methods=['POST'])
def api_recommend():
    """
    Content-Based Filtering dengan TF-IDF + Cosine Similarity
    Input: { genres: ["Action", "Horror"], fiturs: ["Single-player", "Steam Achievements"] }
    Output: { results: [...game...] }
    """
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np

    data = request.get_json() or {}
    genres = data.get('genres', [])
    fiturs = data.get('fiturs', [])

    if not genres and not fiturs:
        return jsonify({'error': 'Pilih minimal 1 genre atau fitur!'}), 400

    # 1. Ambil semua game dari DB
    try:
        rows = db.session.execute(text(f"""
            SELECT id, game_name, developer, release_date, price, rating,
                   age_restriction, supported_os, user_defined_tags,
                   other_features, image_url
            FROM best_selling_games
            WHERE user_defined_tags IS NOT NULL
        """)).fetchall()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    if not rows:
        return jsonify({'results': []})

    # 2. Buat dokumen teks untuk setiap game
    game_docs = []
    for row in rows:
        tags  = (row.user_defined_tags or '').replace(',', ' ')
        feats = (row.other_features or '').replace(',', ' ')
        doc   = f"{tags} {feats}"
        game_docs.append(doc)

    # 3. Query dari user
    user_query = ' '.join(genres + fiturs)

    # 4. TF-IDF
    all_docs = game_docs + [user_query]
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(all_docs)

    # 5. Cosine Similarity antara query user dan semua game
    query_vec   = tfidf_matrix[-1]     # vektor user
    game_matrix = tfidf_matrix[:-1]    # vektor semua game
    scores      = cosine_similarity(query_vec, game_matrix).flatten()

    # 6. Ranking — ambil top 20
    top_indices = np.argsort(scores)[::-1][:20]

    results = []
    for idx in top_indices:
        if scores[idx] == 0:
            continue
        row = rows[idx]
        results.append({
            **format_game_row(row),
            'similarity_score': round(float(scores[idx]), 4)
        })

    return jsonify({'results': results, 'query': {'genres': genres, 'fiturs': fiturs}})   

import base64

@app.route('/api/profile/update', methods=['POST'])
@login_required
def api_profile_update():
    data  = request.get_json() or {}
    bio   = data.get('bio', '').strip()
    image = data.get('image', None)  # base64 string
    
    user_id = session['user_id']
    
    try:
        if image:
            db.session.execute(text(
                "UPDATE `user` SET bio=:bio, profile_image=:img WHERE id=:id"
            ), {'bio': bio, 'img': image, 'id': user_id})
        else:
            db.session.execute(text(
                "UPDATE `user` SET bio=:bio WHERE id=:id"
            ), {'bio': bio, 'id': user_id})
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/profile/me')
@login_required  
def api_profile_me():
    user_id = session['user_id']
    try:
        row = db.session.execute(text(
            "SELECT name, bio, profile_image FROM `user` WHERE id=:id"
        ), {'id': user_id}).fetchone()
        return jsonify({
            'name':  row.name,
            'bio':   row.bio or 'Game Hunter Member',
            'image': row.profile_image or None,
        })
    except Exception as e:
        return jsonify({'name': session.get('user_name'), 'bio': 'Game Hunter Member', 'image': None})

# Tambahkan ke app/routes.py (endpoint publik, tidak perlu login)

@app.route('/api/popular-games')
def api_popular_games():
    """Endpoint publik untuk landing page - ambil 10 game paling banyak dibicarakan"""
    try:
        rows = db.session.execute(text(f"""
            SELECT id, game_name, developer, release_date, price, rating,
                   age_restriction, supported_os, user_defined_tags, other_features,
                   image_url FROM best_selling_games
            ORDER BY all_reviews_number DESC LIMIT 10
        """)).fetchall()
        return jsonify({'games': [format_game_row(r) for r in rows]})
    except Exception as e:
        return jsonify({'games': []})