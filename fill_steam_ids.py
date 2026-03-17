"""
Script untuk mengisi steam_app_id di DB dari Steam Store API.
Jalankan dengan: python fill_steam_ids.py
"""
import requests
import pymysql
import time
import re

DB_HOST     = '127.0.0.1'
DB_USER     = 'root'
DB_PASSWORD = ''
DB_NAME     = 'db_games'

def clean_name(name):
    """Bersihkan karakter khusus untuk pencarian"""
    name = re.sub(r'[™®©]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def fetch_steam_id(game_name):
    cleaned = clean_name(game_name)
    # Coba 2 variasi pencarian
    search_queries = [
        cleaned,                        # nama bersih
        cleaned.split(':')[0].strip(),  # ambil sebelum titik dua
    ]
    for query in search_queries:
        if not query:
            continue
        try:
            res = requests.get(
                'https://store.steampowered.com/api/storesearch/',
                params={
                    'term': query,
                    'l': 'english',
                    'cc': 'US'
                },
                timeout=8
            )
            if res.status_code == 200:
                items = res.json().get('items', [])
                if not items:
                    continue
                # Cari yang namanya exact match dulu
                query_lower = query.lower()
                for item in items:
                    item_name = re.sub(r'[™®©]', '', item.get('name', '')).strip().lower()
                    if item_name == query_lower:
                        return item.get('id')
                # Kalau tidak ada exact match, ambil hasil pertama
                if items[0].get('id'):
                    return items[0].get('id')
        except Exception as e:
            print(f"  [ERROR] {e}")
    return None

def main():
    conn = pymysql.connect(
        host=DB_HOST, user=DB_USER,
        password=DB_PASSWORD, database=DB_NAME,
        charset='utf8mb4'
    )
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, game_name FROM best_selling_games
        WHERE steam_app_id IS NULL OR steam_app_id = ''
        ORDER BY id ASC
    """)
    games = cursor.fetchall()
    total = len(games)
    print(f"Total game yang perlu diisi steam_app_id: {total}")
    print("=" * 50)

    found    = 0
    notfound = 0

    for i, (game_id, game_name) in enumerate(games, 1):
        print(f"[{i}/{total}] {game_name}...", end=' ')
        app_id = fetch_steam_id(game_name)
        if app_id:
            cursor.execute(
                "UPDATE best_selling_games SET steam_app_id = %s WHERE id = %s",
                (app_id, game_id)
            )
            conn.commit()
            print(f"✓ app_id={app_id}")
            found += 1
        else:
            print("✗ Tidak ditemukan")
            notfound += 1
        time.sleep(0.5)  # delay agar tidak kena rate limit Steam

    cursor.close()
    conn.close()
    print("=" * 50)
    print(f"✓ Berhasil    : {found}")
    print(f"✗ Tidak ditemukan: {notfound}")
    print("Selesai!")

if __name__ == '__main__':
    main()