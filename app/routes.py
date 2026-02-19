from flask import render_template, request, redirect, url_for
from app import app

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # nanti kita sambungkan ke database
        pass
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirm  = request.form['confirm_password']
        # nanti kita sambungkan ke database
        pass
    return render_template('register.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', active_page='dashboard')

@app.route('/rekomendasi')
def rekomendasi():
    return render_template('rekomendasi_populer.html', active_page='rekomendasi')

@app.route('/search')
def search():
    return render_template('search.html', active_page='search')

@app.route('/favorit')
def favorit():
    return render_template('favorit.html', active_page='favorit')