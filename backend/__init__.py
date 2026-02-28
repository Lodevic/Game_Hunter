from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

app = Flask(__name__,
    template_folder='templates',
    static_folder='../static'
)

app.config.from_object(Config)
db.init_app(app)

# CORS — izinkan React akses Flask
CORS(app,
     origins=['http://localhost:5173'],
     supports_credentials=True)

from app import routes