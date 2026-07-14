import mysql.connector
import math

# ── Koneksi DB ──────────────────────────────────────────
conn = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="",
    database="db_games"
)
cursor = conn.cursor(dictionary=True)
cursor.execute("""
    SELECT game_name, user_defined_tags, other_features
    FROM best_selling_games
    WHERE game_name IN (
        'Coin Flipper',
        'Dale & Dawson Stationery Supplies',
        'Hellbreach: Vegas',
        'Geometric Sniper - Z',
        'MEMOLOGY 2: OLD TIMES'
    )
""")
rows = cursor.fetchall()
cursor.close()
conn.close()

# ── Query user (sama seperti input sistem) ───────────────
genres = ["RPG"]
fiturs = ["Single-player", "Steam Achievements", "Family Sharing",
          "Online PvP", "Online Co-op", "LAN Co-op", "Steam Cloud"]

user_query_terms = [t.upper() for t in genres + fiturs]

# ── Bentuk dokumen dari DB ───────────────────────────────
game_names = []
game_docs  = []

for row in rows:
    tags  = [t.strip().upper() for t in (row['user_defined_tags'] or '').split(',') if t.strip()]
    fitur = [t.strip().upper() for t in (row['other_features'] or '').split(',') if t.strip()]
    game_names.append(row['game_name'])
    game_docs.append(tags + fitur)

# ── Kumpulkan semua term unik ────────────────────────────
all_terms = set(user_query_terms)
for doc in game_docs:
    all_terms.update(doc)
all_terms = sorted(all_terms)

# ── Bentuk TF (biner: ada=1, tidak=0) ───────────────────
N = len(game_docs)  # jumlah dokumen = 5

def tf_vector(term_list, all_terms):
    return {t: (1 if t in term_list else 0) for t in all_terms}

query_tf = tf_vector(user_query_terms, all_terms)
docs_tf  = [tf_vector(doc, all_terms) for doc in game_docs]

# ── Hitung DF dan IDF (log10(N/DF)) persis seperti Excel ──
df  = {}
idf = {}
for term in all_terms:
    count = sum(1 for doc_tf in docs_tf if doc_tf[term] == 1)
    # Cek juga di query
    df[term]  = count
    # IDF = log10(N / DF), kalau DF=0 maka IDF=0
    idf[term] = math.log(N / count) if count > 0 else 0

# ── Hitung TF-IDF ────────────────────────────────────────
def tfidf_vector(tf, idf, all_terms):
    return {t: tf[t] * idf[t] for t in all_terms}

query_tfidf = tfidf_vector(query_tf, idf, all_terms)
docs_tfidf  = [tfidf_vector(doc_tf, idf, all_terms) for doc_tf in docs_tf]

# ── Hitung Cosine Similarity ─────────────────────────────
def dot_product(v1, v2, terms):
    return sum(v1[t] * v2[t] for t in terms)

def magnitude(v, terms):
    return math.sqrt(sum(v[t]**2 for t in terms))

# ── Mapping nama game ke kode dokumen ───────────────────
doc_codes = {
    'Coin Flipper':                       'D1',
    'Dale & Dawson Stationery Supplies':  'D2',
    'Hellbreach: Vegas':                  'D3',
    'Geometric Sniper - Z':               'D4',
    'MEMOLOGY 2: OLD TIMES':              'D5',
}

print("\n=== PERHITUNGAN COSINE SIMILARITY (Rumus Manual) ===\n")
print(f"Query : {', '.join(user_query_terms)}\n")
mag_query = magnitude(query_tfidf, all_terms)
results = []
for i, name in enumerate(game_names):
    dot   = dot_product(query_tfidf, docs_tfidf[i], all_terms)
    mag_d = magnitude(docs_tfidf[i], all_terms)
    denom = mag_query * mag_d
    score = dot / denom if denom > 0 else 0
    results.append((name, score))
    kode  = doc_codes.get(name, '??')
    print(f"  {kode} - {name:<45} Score: {round(score, 4)}")