from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE']   = False

    db.init_app(app)

    CORS(app,
         origins=['http://localhost:5173'],
         supports_credentials=True)

    from backend.routes.routes import register_routes
    register_routes(app)

    return app