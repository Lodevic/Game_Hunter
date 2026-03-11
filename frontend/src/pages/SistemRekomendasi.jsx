import { useState } from 'react'
import Navbar    from '../components/Navbar'
import Footer    from '../components/Footer'
import GameCard  from '../components/GameCard'
import GamePopup from '../components/GamePopup'
import { favoritAPI } from '../services/api'
import PageLoading from '../components/PageLoading'

const GENRES = [
  '2.5D','2D','Action','Adventure','Anime','Automation','Building','CRPG',
  'Card Game','Combat','Crafting','Cute','Driving','Early Access','FPS',
  'Fantasy','Fighting','Horror','JRPG','MMORPG','Management','Open World',
  'Pixel Graphics','Platformer','Puzzle','RPG','Realistic','Roguelike',
  'Sandbox','Sexual Content','Shooter','Simulation','Souls-like','Sports',
  'Stealth','Story Rich','Strategy','Survival','Tactical','Turn-Based',
  'Visual Novel','War'
]

const FITURS = [
  'Single-player','Online Co-op','Online PvP','LAN Co-op','LAN PvP',
  'Cross-Platform Multiplayer','Family Sharing','In-App Purchases',
  'Steam Achievements','Steam Cloud','Steam Workshop','Steam Trading Cards',
  'Steam Leaderboards','Steam Timeline','Steam Turn Notifications',
  'SteamVR Collectibles','Remote Play Together',
  'Remote Play on Phone','Remote Play on Tablet','Remote Play on TV',
  'Shared/Split Screen Co-op','Shared/Split Screen PvP',
  'MMO','VR Supported','VR Only','HDR available',
  'Captions available','Commentary available',
  'Includes level editor','Includes Source SDK',
  'Tracked Controller Support','Stats'
]

const IconTarget = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)

const IconGamepad = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5S19.33 12 18.5 12z"/>
  </svg>
)

export default function SistemRekomendasi() {
  const [selGenres,   setSelGenres]   = useState([])
  const [selFiturs,   setSelFiturs]   = useState([])
  const [results,     setResults]     = useState([])
  const [searched,    setSearched]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [popup,       setPopup]       = useState(null)
  const [favIds,      setFavIds]      = useState(new Set())

  function toggleGenre(g) {
    setSelGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }
  function toggleFitur(f) {
    setSelFiturs(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  async function handleRecommend() {
    if (!selGenres.length && !selFiturs.length) return
    setLoading(true)
    try {
      const [res, fav] = await Promise.all([
        fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ genres: selGenres, fiturs: selFiturs })
        }).then(r => r.json()),
        favoritAPI.getIds()
      ])

      const sorted = (res.results || []).sort((a, b) => {
        const pctA = Math.round(parseFloat(a.similarity_score) * 100)
        const pctB = Math.round(parseFloat(b.similarity_score) * 100)
        if (pctB !== pctA) return pctB - pctA
        return parseFloat(b.rating_raw || 0) - parseFloat(a.rating_raw || 0)
      })

      setResults(sorted)
      setFavIds(new Set(fav.favorites.map(String)))
      setSearched(true)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  function handleFavChange(gameId, status) {
    setFavIds(prev => {
      const next = new Set(prev)
      status === 'added' ? next.add(String(gameId)) : next.delete(String(gameId))
      return next
    })
  }

  const hasSelection = selGenres.length > 0 || selFiturs.length > 0

  return (
    <>
      <style>{`
        .rek-page { min-height: 100vh; }
        .rek-hero {
          background: linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 50%, #0d0d0d 100%);
          border-bottom: 1px solid #1f1f1f;
          padding: 48px 60px 40px;
        }
        .rek-hero-title {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem; font-weight: 900;
          letter-spacing: 3px; color: #fff;
          margin-bottom: 8px;
        }
        .rek-hero-title svg { color: #e63946; }
        .rek-hero-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.95rem; color: #555; font-weight: 600;
        }
        .rek-content { padding: 40px 60px; }
        .filter-section { margin-bottom: 32px; }
        .filter-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem; font-weight: 900;
          letter-spacing: 3px; color: #555;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .filter-label span { display: inline-block; width: 24px; height: 2px; background: #e63946; }
        .filter-label span.blue { background: #4a90d9; }
        .tags-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag-btn {
          padding: 6px 14px; border-radius: 6px;
          font-size: 0.82rem; font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
          cursor: pointer; border: 1.5px solid #222;
          background: #111; color: #555;
          transition: all 0.15s; letter-spacing: 0.5px;
        }
        .tag-btn:hover { border-color: #444; color: #888; }
        .tag-btn.active-genre { border-color: #e63946; background: rgba(230,57,70,0.12); color: #e63946; }
        .tag-btn.active-fitur { border-color: #4a90d9; background: rgba(74,144,217,0.12); color: #4a90d9; }
        .selection-preview {
          background: #111; border: 1px solid #1f1f1f;
          border-radius: 10px; padding: 16px 20px;
          margin-bottom: 24px;
          display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
        }
        .selection-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .selection-label {
          font-size: 0.78rem; color: #444; font-weight: 700;
          font-family: 'Rajdhani', sans-serif; letter-spacing: 1px; min-width: 130px;
        }
        .sel-tag-genre {
          padding: 3px 10px; border-radius: 4px;
          background: rgba(230,57,70,0.15); border: 1px solid rgba(230,57,70,0.4);
          color: #e63946; font-size: 0.78rem; font-weight: 700;
        }
        .sel-tag-fitur {
          padding: 3px 10px; border-radius: 4px;
          background: rgba(74,144,217,0.12); border: 1px solid rgba(74,144,217,0.4);
          color: #4a90d9; font-size: 0.78rem; font-weight: 700;
        }
        .rec-actions { display: flex; gap: 12px; margin-bottom: 40px; align-items: center; }
        .btn-rec {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 36px; background: #e63946; border: none;
          border-radius: 8px; color: #fff;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem; font-weight: 900;
          letter-spacing: 2px; cursor: pointer; transition: all 0.2s;
        }
        .btn-rec:hover:not(:disabled) { background: #c62d3a; transform: translateY(-1px); }
        .btn-rec:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-reset {
          padding: 14px 24px; background: transparent;
          border: 1.5px solid #222; border-radius: 8px; color: #444;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.9rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-reset:hover { border-color: #444; color: #666; }

        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .loading-state {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 0; gap: 20px;
        }
        .pl-logo-ring-sm { position: relative; width: 56px; height: 56px; }
        .pl-ring-sm {
          position: absolute; inset: 0;
          border: 3px solid rgba(230,57,70,0.15);
          border-top-color: #e63946; border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }
        .pl-ring-sm-2 {
          position: absolute; inset: 8px;
          border: 2px solid rgba(230,57,70,0.08);
          border-bottom-color: #e63946; border-radius: 50%;
          animation: spin 1.4s linear infinite reverse;
        }
        .pl-logo-inner-sm {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .pl-logo-inner-sm img {
          width: 22px; height: 22px; object-fit: contain;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .loading-text {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem; font-weight: 900;
          letter-spacing: 3px; color: #555;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .pl-dots { display: flex; gap: 6px; }
        .pl-dot {
          width: 4px; height: 4px; border-radius: 50%; background: #e63946;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .pl-dot:nth-child(2) { animation-delay: 0.2s; }
        .pl-dot:nth-child(3) { animation-delay: 0.4s; }

        .result-header {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 24px; padding-bottom: 16px;
          border-bottom: 1px solid #1a1a1a;
        }
        .result-title {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem; font-weight: 900;
          letter-spacing: 3px; color: #fff;
        }
        .result-count {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.9rem; color: #555; font-weight: 600;
        }
        .sim-badge {
          position: absolute; top: 8px; left: 8px;
          background: rgba(0,0,0,0.85); color: #4ade80;
          font-size: 0.65rem; font-weight: 900;
          padding: 3px 8px; border-radius: 4px; z-index: 10;
          font-family: 'Orbitron', sans-serif;
          border: 1px solid rgba(74,222,128,0.3);
        }
        .fav-badge-rek {
          position: absolute; top: 6px; right: 6px; z-index: 10;
          background: rgba(230,57,70,0.9);
          color: #fff; font-size: 0.65rem;
          padding: 2px 6px; border-radius: 4px;
          font-weight: 900;
        }
        .empty-state-rek {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px 0; gap: 16px; color: #2a2a2a;
        }
        .empty-state-rek svg { color: #2a2a2a; }
        .empty-state-rek div {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem; letter-spacing: 3px; color: #333;
        }
        .rek-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: flex-start;
        }
        .rek-card-wrap {
          position: relative;
          width: 220px;
          flex-shrink: 0;
        }
        .rek-card-wrap .game-card {
          width: 220px !important;
        }
      `}</style>

      <Navbar />
      <div className="rek-page">

        <div className="rek-hero">
          <div className="rek-hero-title">
            <IconTarget />
            SISTEM REKOMENDASI
          </div>
          <div className="rek-hero-sub">Pilih genre dan fitur favoritmu, kami carikan game yang paling cocok</div>
        </div>

        <div className="rek-content">

          {/* FILTER GENRE */}
          <div className="filter-section">
            <div className="filter-label"><span/>GENRE GAME</div>
            <div className="tags-wrap">
              {GENRES.map(g => (
                <button key={g} onClick={() => toggleGenre(g)}
                  className={`tag-btn ${selGenres.includes(g) ? 'active-genre' : ''}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* FILTER FITUR */}
          <div className="filter-section">
            <div className="filter-label"><span className="blue"/>FITUR GAME</div>
            <div className="tags-wrap">
              {FITURS.map(f => (
                <button key={f} onClick={() => toggleFitur(f)}
                  className={`tag-btn ${selFiturs.includes(f) ? 'active-fitur' : ''}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* SELECTION PREVIEW */}
          {hasSelection && (
            <div className="selection-preview">
              {selGenres.length > 0 && (
                <div className="selection-row">
                  <span className="selection-label">Genre dipilih :</span>
                  {selGenres.map(g => <span key={g} className="sel-tag-genre">{g}</span>)}
                </div>
              )}
              {selFiturs.length > 0 && (
                <div className="selection-row">
                  <span className="selection-label">Fitur dipilih :</span>
                  {selFiturs.map(f => <span key={f} className="sel-tag-fitur">{f}</span>)}
                </div>
              )}
            </div>
          )}

          {/* TOMBOL */}
          <div className="rec-actions">
            <button className="btn-rec" onClick={handleRecommend}
              disabled={loading || !hasSelection}>
              {loading
                ? <><div className="spinner"/> MEMPROSES...</>
                : <><IconTarget /> CARI REKOMENDASI</>
              }
            </button>
            {hasSelection && !loading && (
              <button className="btn-reset" onClick={() => {
                setSelGenres([]); setSelFiturs([])
                setResults([]); setSearched(false)
              }}>Reset Filter</button>
            )}
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="loading-state">
              <div className="pl-logo-ring-sm">
                <div className="pl-ring-sm"/>
                <div className="pl-ring-sm-2"/>
                <div className="pl-logo-inner-sm">
                  <img src="/Logo.png" alt="loading"/>
                </div>
              </div>
              <div className="loading-text">MENCARI REKOMENDASI...</div>
              <div className="pl-dots">
                <div className="pl-dot"/>
                <div className="pl-dot"/>
                <div className="pl-dot"/>
              </div>
            </div>
          )}

          {/* HASIL */}
          {searched && !loading && (
            <>
              <div className="result-header">
                <div className="result-title">
                  <span style={{color:'#e63946'}}><IconTarget /></span>
                  HASIL REKOMENDASI
                </div>
                <div className="result-count">{results.length} game ditemukan</div>
              </div>
              {results.length === 0 ? (
                <div className="empty-state-rek">
                  <IconGamepad />
                  <div>TIDAK ADA GAME YANG COCOK. COBA FILTER LAIN.</div>
                </div>
              ) : (
                <div className="rek-grid">
                  {results.map(game => (
                    <div key={game.id} className="rek-card-wrap">
                      {favIds.has(String(game.id)) && (
                        <div className="fav-badge-rek">♥</div>
                      )}
                      <div className="sim-badge">
                        {Math.round(parseFloat(game.similarity_score) * 100)}%
                      </div>
                      <GameCard game={game} onClick={setPopup} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* EMPTY STATE */}
          {!searched && !loading && (
            <div className="empty-state-rek">
              <IconTarget />
              <div>PILIH GENRE DAN FITUR DI ATAS UNTUK MULAI</div>
            </div>
          )}

        </div>
      </div>

      <Footer />
      {popup && (
        <GamePopup game={popup} favIds={favIds}
          onClose={() => setPopup(null)} onFavChange={handleFavChange}/>
      )}
    </>
  )
}