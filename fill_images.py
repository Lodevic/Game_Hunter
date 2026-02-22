"""
Script ini dijalankan SEKALI untuk mengisi semua image_url yang masih NULL di DB.
Jalankan dengan: python fill_images.py
"""

import requests
import pymysql
import time

# ── SESUAIKAN DENGAN SETTING DB KAMU ──
DB_HOST     = '127.0.0.1'
DB_USER     = 'root'
DB_PASSWORD = ''
DB_NAME     = 'db_games'
RAWG_KEY    = '8d72c45a17f746309288d44c79608066'

def fetch_image(game_name):
    try:
        res = requests.get(
            'https://api.rawg.io/api/games',
            params={
                'key': RAWG_KEY,
                'search': game_name,
                'page_size': 1,
                'search_precise': True
            },
            timeout=8
        )
        if res.status_code == 200:
            results = res.json().get('results', [])
            if results and results[0].get('background_image'):
                return results[0]['background_image']
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

    # Ambil semua game yang image_url masih NULL atau kosong
    cursor.execute("""
        SELECT id, game_name FROM best_selling_games
        WHERE image_url IS NULL OR image_url = ''
        ORDER BY id ASC
    """)
    games = cursor.fetchall()

    total = len(games)
    print(f"Total game yang perlu diisi gambar: {total}")
    print("=" * 50)

    for i, (game_id, game_name) in enumerate(games, 1):
        print(f"[{i}/{total}] {game_name}...", end=' ')
        image_url = fetch_image(game_name)

        if image_url:
            cursor.execute(
                "UPDATE best_selling_games SET image_url = %s WHERE id = %s",
                (image_url, game_id)
            )
            conn.commit()
            print(f"✓ Tersimpan")
        else:
            print(f"✗ Tidak ditemukan")

        # Jeda 0.3 detik agar tidak kena rate limit RAWG
        time.sleep(0.3)

    cursor.close()
    conn.close()
    print("=" * 50)
    print("Selesai! Semua gambar sudah diisi ke database.")


if __name__ == '__main__':
    main()