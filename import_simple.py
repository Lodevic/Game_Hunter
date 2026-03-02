import pandas as pd
import mysql.connector

print("="*70)
print("IMPORT DATA - DENGAN FIX ENCODING")
print("="*70)

# 1. Baca CSV dengan fix encoding
print("\n[1] Membaca CSV...")
try:
    # Coba UTF-8 dulu
    df = pd.read_csv("bestSelling_games_CLEAN.csv", encoding='utf-8')
except UnicodeDecodeError:
    # Kalau gagal, baca latin-1 lalu fix ke UTF-8
    df = pd.read_csv("bestSelling_games_CLEAN.csv", encoding='latin-1')
    for col in df.select_dtypes(include='object').columns:
        df[col] = df[col].apply(lambda x:
            x.encode('latin-1').decode('utf-8') if isinstance(x, str) else x
        )

print(f"✓ Total baris: {len(df)}")

# 2. Fix karakter rusak di semua kolom string
print("\n[2] Fix encoding karakter...")
ENCODING_MAP = {
    'â„¢': '™',
    'â€™': "'",
    'â€œ': '"',
    'â€':  '"',
    'Ã©':  'é',
    'Ã¨':  'è',
    'Ã ':  'à',
    'Ã¢':  'â',
    'Ã®':  'î',
    'Ã´':  'ô',
    'Ã»':  'û',
    'Ã§':  'ç',
    'Ã«':  'ë',
    'Ã¯':  'ï',
    'Ã¹':  'ù',
    'Ã¼':  'ü',
    'Ã¶':  'ö',
    'Ã¤':  'ä',
    'Ã±':  'ñ',
    'Ã':   'Á',
    'â€"': '–',
    'â€"': '—',
    'Â®':  '®',
    'Â©':  '©',
}

def fix_text(val):
    if not isinstance(val, str):
        return val
    for bad, good in ENCODING_MAP.items():
        val = val.replace(bad, good)
    return val

for col in df.select_dtypes(include='object').columns:
    df[col] = df[col].apply(fix_text)

print("✓ Encoding fix selesai!")

# Cek sample hasil fix
print("\nSample nama game setelah fix:")
for name in df['game_name'].head(10):
    print(f"  - {name}")

# 3. Koneksi
print("\n[3] Koneksi database...")
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="db_games",
    charset='utf8mb4'        # ← penting untuk karakter khusus
)
cursor = conn.cursor()
print("✓ Koneksi berhasil!")

# 4. Hapus data lama
print("\n[4] Menghapus data lama...")
cursor.execute("DELETE FROM best_selling_games")
conn.commit()
print("✓ Data lama dihapus!")

# 5. Insert data
print("\n[5] Insert data...")
sql = """
INSERT INTO best_selling_games 
(game_name, reviews_like_rate, all_reviews_number, release_date, 
 developer, user_defined_tags, supported_os, supported_languages, 
 price, other_features, age_restriction, rating, difficulty, 
 length, estimated_downloads)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

success = 0
errors  = 0

for i, row in df.iterrows():
    try:
        values = []
        for col in df.columns:
            val = row[col]
            if pd.isna(val):
                values.append(None)
            else:
                values.append(val)

        cursor.execute(sql, tuple(values))
        conn.commit()
        success += 1

        if (i + 1) % 50 == 0:
            print(f"  Progress: {i+1}/{len(df)}")

    except Exception as e:
        errors += 1
        if errors <= 3:
            print(f"  Error baris {i+1}: {str(e)[:80]}")

print(f"\n{'='*70}")
print(f"SELESAI!")
print(f"{'='*70}")
print(f"✓ Berhasil: {success}")
print(f"✗ Error   : {errors}")
print(f"{'='*70}")

cursor.close()
conn.close()