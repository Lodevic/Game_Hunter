import pandas as pd
import mysql.connector

# Load file hasil export dari Colab
df = pd.read_csv('hasil_final.csv')

print("Cek kolom:", df.columns.tolist())
print("Cek data:")
print(df[['game_name', 'user_defined_tags_clean', 'other_features_clean']].head(3))

conn = mysql.connector.connect(
    host='127.0.0.1',
    user='root',
    password='',
    database='db_games'
)
cursor = conn.cursor()

berhasil = 0
gagal = 0

for _, row in df.iterrows():
    try:
        cursor.execute("""
            UPDATE best_selling_games
            SET user_defined_tags = %s,
                other_features = %s
            WHERE game_name = %s
        """, (
            str(row['user_defined_tags_clean']),
            str(row['other_features_clean']),
            row['game_name']
        ))
        berhasil += 1
    except Exception as e:
        print(f"Gagal: {row['game_name']} — {e}")
        gagal += 1

conn.commit()
cursor.close()
conn.close()
print(f"✅ Selesai! Berhasil: {berhasil}, Gagal: {gagal}")