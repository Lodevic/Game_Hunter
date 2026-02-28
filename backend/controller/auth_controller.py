from flask import render_template, request, redirect, url_for, session
from app.model.user import User
from app.model.game import get_random_bg_images


def login_page():
    """GET /login — tampilkan form login."""
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

    bg_images = get_random_bg_images(50)
    return render_template('login.html', error=error, bg_images=bg_images)


def register_page():
    """GET/POST /register — tampilkan & proses form registrasi."""
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
            from app import db
            db.session.add(new_user)
            db.session.commit()
            session['user_id']   = new_user.id
            session['user_name'] = new_user.name
            return redirect(url_for('dashboard'))

    bg_images = get_random_bg_images(50)
    return render_template('register.html', error=error, bg_images=bg_images)


def logout_page():
    """GET /logout — hapus session dan redirect ke login."""
    session.clear()
    return redirect(url_for('login'))