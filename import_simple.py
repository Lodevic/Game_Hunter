import pandas as pd
import mysql.connector

print("="*70)
print("IMPORT DATA - VERSI SEDERHANA (PASTI BERHASIL)")
print("="*70)

# 1. Baca CSV
print("\n[1] Membaca CSV...")
df = pd.read_csv("bestSelling_games_CLEAN.csv")
print(f"✓ Total baris: {len(df)}")

# 2. Koneksi
print("\n[2] Koneksi database...")
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="db_games"
)
cursor = conn.cursor()
print("✓ Koneksi berhasil!")

# 3. Hapus data lama (opsional)
print("\n[3] Menghapus data lama...")
cursor.execute("DELETE FROM best_selling_games")
conn.commit()
print("✓ Data lama dihapus!")

# 4. Insert data satu per satu dengan commit setiap baris
print("\n[4] Insert data...")
sql = """
INSERT INTO best_selling_games 
(game_name, reviews_like_rate, all_reviews_number, release_date, 
 developer, user_defined_tags, supported_os, supported_languages, 
 price, other_features, age_restriction, rating, difficulty, 
 length, estimated_downloads)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

success = 0
errors = 0

for i, row in df.iterrows():
    try:
        # Konversi NaN jadi None
        values = []
        for col in df.columns:
            val = row[col]
            if pd.isna(val):
                values.append(None)
            else:
                values.append(val)
        
        cursor.execute(sql, tuple(values))
        conn.commit()  # Commit setiap baris!
        success += 1
        
        if (i + 1) % 50 == 0:
            print(f"  Progress: {i+1}/{len(df)}")
            
    except Exception as e:
        errors += 1
        if errors <= 3:
            print(f"  Error baris {i+1}: {str(e)[:60]}")

print(f"\n{'='*70}")
print(f"SELESAI!")
print(f"{'='*70}")
print(f"✓ Berhasil: {success}")
print(f"✗ Error: {errors}")
print(f"{'='*70}")

cursor.close()
conn.close()
