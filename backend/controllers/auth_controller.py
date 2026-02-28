from flask import request, session, jsonify
from functools import wraps
from backend import db
from backend.models.user import User
from sqlalchemy import text


# ════════════════════════════
#  MIDDLEWARE
# ════════════════════════════

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated


# ════════════════════════════
#  AUTH
# ════════════════════════════

def api_me():
    if 'user_id' not in session:
        return jsonify({'logged_in': False}), 200
    return jsonify({
        'logged_in': True,
        'user_id':   session['user_id'],
        'user_name': session.get('user_name', ''),
    })


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


def api_register():
    data     = request.get_json() or {}
    name     = (data.get('name') or '').strip()
    email    = (data.get('email') or '').strip()
    password = (data.get('password') or '').strip()
    confirm  = (data.get('confirm_password') or '').strip()
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


def api_logout():
    session.clear()
    return jsonify({'success': True})


# ════════════════════════════
#  PROFILE
# ════════════════════════════

def api_profile():
    return jsonify({
        'user_name': session.get('user_name', ''),
        'user_id':   session.get('user_id'),
    })


def api_profile_me():
    user_id = session['user_id']
    try:
        row = db.session.execute(
            text("SELECT name, bio, profile_image FROM `user` WHERE id=:id"),
            {'id': user_id}
        ).fetchone()
        return jsonify({
            'name':  row.name,
            'bio':   row.bio or 'Game Hunter Member',
            'image': row.profile_image or None,
        })
    except Exception:
        return jsonify({'name': session.get('user_name'), 'bio': 'Game Hunter Member', 'image': None})


def api_profile_update():
    data    = request.get_json() or {}
    bio     = data.get('bio', '').strip()
    image   = data.get('image', None)
    user_id = session['user_id']
    try:
        if image:
            db.session.execute(
                text("UPDATE `user` SET bio=:bio, profile_image=:img WHERE id=:id"),
                {'bio': bio, 'img': image, 'id': user_id}
            )
        else:
            db.session.execute(
                text("UPDATE `user` SET bio=:bio WHERE id=:id"),
                {'bio': bio, 'id': user_id}
            )
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500