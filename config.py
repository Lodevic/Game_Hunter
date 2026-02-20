import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'gamehunter-secret-key-2025')

    # MySQL connection
    DB_HOST     = os.environ.get('DB_HOST', '127.0.0.1')
    DB_DATABASE = os.environ.get('DB_DATABASE', 'db_games')
    DB_USERNAME = os.environ.get('DB_USERNAME', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{DB_DATABASE}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False