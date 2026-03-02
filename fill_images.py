"""
Script untuk mengisi image_url di DB dari RAWG API.
Jalankan dengan: python fill_images.py
"""
import requests
import pymysql
import time
import re

DB_HOST     = '127.0.0.1'
DB_USER     = 'root'
DB_PASSWORD = ''
DB_NAME     = 'db_games'
RAWG_KEY    = '8d72c45a17f746309288d44c79608066'


def clean_name(name):
    """Bersihkan karakter khusus untuk pencarian"""
    name = re.sub(r'[™®©]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name


def fetch_image(game_name):
    cleaned = clean_name(game_name)

    # Coba 2 variasi pencarian
    search_queries = [
        cleaned,                          # nama bersih
        cleaned.split(':')[0].strip(),    # ambil sebelum titik dua, misal "Elden Ring: DLC" → "Elden Ring"
    ]

    for query in search_queries:
        if not query:
            continue
        try:
            # Coba search_precise dulu
            for precise in [True, False]:
                res = requests.get(
                    'https://api.rawg.io/api/games',
                    params={
                        'key': RAWG_KEY,
                        'search': query,
                        'page_size': 3,
                        'search_precise': precise
                    },
                    timeout=8
                )
                if res.status_code == 200:
                    results = res.json().get('results', [])
                    for r in results:
                        if r.get('background_image'):
                            return r['background_image']
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
        WHERE image_url IS NULL OR image_url = ''
        ORDER BY id ASC
    """)
    games = cursor.fetchall()
    total = len(games)
    print(f"Total game yang perlu diisi gambar: {total}")
    print("=" * 50)

    found    = 0
    notfound = 0

    for i, (game_id, game_name) in enumerate(games, 1):
        print(f"[{i}/{total}] {game_name}...", end=' ')
        image_url = fetch_image(game_name)
        if image_url:
            cursor.execute(
                "UPDATE best_selling_games SET image_url = %s WHERE id = %s",
                (image_url, game_id)
            )
            conn.commit()
            print("✓ Tersimpan")
            found += 1
        else:
            print("✗ Tidak ditemukan")
            notfound += 1

        time.sleep(0.3)

    cursor.close()
    conn.close()
    print("=" * 50)
    print(f"✓ Berhasil : {found}")
    print(f"✗ Tidak ditemukan: {notfound}")
    print("Selesai!")


if __name__ == '__main__':
    main()