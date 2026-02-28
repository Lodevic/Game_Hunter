import { useState } from 'react'
import Navbar    from '../components/Navbar'
import Footer    from '../components/Footer'
import GameCard  from '../components/GameCard'
import GamePopup from '../components/GamePopup'
import { searchAPI, favoritAPI } from '../services/api'

const GENRES = [
  '2.5D','2D','Action','Adventure','Anime','Automation','Building','CRPG',
  'Card Game','Combat','Crafting','Cute','Driving','Early Access','FPS',
  'Fantasy','Fighting','Horror','JRPG','MMORPG','Management','Open World',
  'Pixel Graphics','Platformer','Puzzle','RPG','Realistic','Roguelike',
  'Sandbox','Shooter','Simulation','Souls-like','Sports',
  'Stealth','Story Rich','Strategy','Survival','Tactical','Turn-Based',
  'Visual Novel','War'
]

const FITURS = [
  'Single-player','Online Co-op','Online PvP','LAN Co-op','LAN PvP',
  'Cross-Platform Multiplayer','Family Sharing','In-App Purchases',
  'Steam Achievements','Steam Cloud','Steam Workshop','Steam Trading Cards',
  'Remote Play Together','Shared/Split Screen Co-op','Shared/Split Screen PvP',
  'MMO','VR Supported','VR Only','HDR available','Captions available',
  'Includes level editor','Stats'
]

export default function Search() {
  const [keyword,     setKeyword]     = useState('')
  const [results,     setResults]     = useState([])
  const [searched,    setSearched]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [popup,       setPopup]       = useState(null)
  const [favIds,      setFavIds]      = useState(new Set())
  const [selGenres,   setSelGenres]   = useState([])
  const [selFiturs,   setSelFiturs]   = useState([])
  const [recResults,  setRecResults]  = useState([])
  const [recSearched, setRecSearched] = useState(false)
  const [recLoading,  setRecLoading]  = useState(false)

  function toggleGenre(g) {
    setSelGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }
  function toggleFitur(f) {
    setSelFiturs(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!keyword.trim()) return
    setLoading(true)
    const [res, fav] = await Promise.all([searchAPI.search(keyword), favoritAPI.getIds()])
    setResults(res.results)
    setFavIds(new Set(fav.favorites.map(String)))
    setSearched(true)
    setLoading(false)
  }

  async function handleRecommend() {
    if (!selGenres.length && !selFiturs.length) return
    setRecLoading(true)
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
      setRecResults(res.results || [])
      setFavIds(new Set(fav.favorites.map(String)))
      setRecSearched(true)
    } catch(e) { console.error(e) }
    setRecLoading(false)
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
        .search-page { min-height: 100vh; }

        /* HERO SEARCH BAR */
        .search-hero {
          background: linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 50%, #0d0d0d 100%);
          border-bottom: 1px solid #1f1f1f;
          padding: 48px 60px 0;
        }
        .search-hero-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 4px;
          color: #e63946;
          margin-bottom: 20px;
          text-transform: uppercase;
        }
        .search-bar-wrap {
          display: flex;
          gap: 0;
          background: #111;
          border: 1.5px solid #2a2a2a;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
          max-width: 800px;
        }
        .search-bar-wrap:focus-within {
          border-color: #e63946;
        }
        .search-bar-wrap input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 18px 24px;
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
        }
        .search-bar-wrap input::placeholder { color: #444; }
        .search-bar-wrap button {
          background: #e63946;
          border: none;
          padding: 0 32px;
          color: #fff;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 2px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .search-bar-wrap button:hover { background: #c62d3a; }

        /* TABS */
        .search-tabs {
          display: flex;
          gap: 0;
          margin-top: 32px;
          border-bottom: none;
          max-width: 800px;
        }
        .search-tab {
          padding: 12px 28px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 2px;
          cursor: pointer;
          border: none;
          background: transparent;
          color: #444;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          position: relative;
        }
        .search-tab.active {
          color: #fff;
          border-bottom: 3px solid #e63946;
        }
        .search-tab:hover:not(.active) { color: #888; }

        /* CONTENT */
        .search-content {
          padding: 40px 60px;
        }

        /* FILTER SECTION */
        .filter-section { margin-bottom: 32px; }
        .filter-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 3px;
          color: #555;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-label span {
          display: inline-block;
          width: 24px;
          height: 2px;
          background: #e63946;
        }
        .tags-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag-btn {
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
          cursor: pointer;
          border: 1.5px solid #222;
          background: #111;
          color: #555;
          transition: all 0.15s;
          letter-spacing: 0.5px;
        }
        .tag-btn:hover { border-color: #444; color: #888; }
        .tag-btn.active-genre {
          border-color: #e63946;
          background: rgba(230,57,70,0.12);
          color: #e63946;
        }
        .tag-btn.active-fitur {
          border-color: #4a90d9;
          background: rgba(74,144,217,0.12);
          color: #4a90d9;
        }

        /* SELECTED PREVIEW */
        .selection-preview {
          background: #111;
          border: 1px solid #1f1f1f;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        .selection-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .selection-label {
          font-size: 0.78rem;
          color: #444;
          font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
          letter-spacing: 1px;
          min-width: 130px;
        }
        .sel-tag-genre {
          padding: 3px 10px;
          border-radius: 4px;
          background: rgba(230,57,70,0.15);
          border: 1px solid rgba(230,57,70,0.4);
          color: #e63946;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .sel-tag-fitur {
          padding: 3px 10px;
          border-radius: 4px;
          background: rgba(74,144,217,0.12);
          border: 1px solid rgba(74,144,217,0.4);
          color: #4a90d9;
          font-size: 0.78rem;
          font-weight: 700;
        }

        /* RECOMMEND BUTTON */
        .rec-actions { display: flex; gap: 12px; margin-bottom: 40px; align-items: center; }
        .btn-rec {
          padding: 14px 36px;
          background: #e63946;
          border: none;
          border-radius: 8px;
          color: #fff;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-rec:hover:not(:disabled) { background: #c62d3a; transform: translateY(-1px); }
        .btn-rec:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-reset {
          padding: 14px 24px;
          background: transparent;
          border: 1.5px solid #222;
          border-radius: 8px;
          color: #444;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-reset:hover { border-color: #444; color: #666; }

        /* RESULT HEADER */
        .result-header {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #1a1a1a;
        }
        .result-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: 3px;
          color: #fff;
        }
        .result-count {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.9rem;
          color: #555;
          font-weight: 600;
        }

        /* SIMILARITY BADGE */
        .sim-badge {
          position: absolute;
          top: 8px; left: 8px;
          background: rgba(0,0,0,0.85);
          color: #4ade80;
          font-size: 0.65rem;
          font-weight: 900;
          padding: 3px 8px;
          border-radius: 4px;
          z-index: 10;
          font-family: 'Orbitron', sans-serif;
          border: 1px solid rgba(74,222,128,0.3);
        }

        /* DIVIDER */
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, #e63946, transparent);
          margin: 40px 0;
          opacity: 0.3;
        }
      `}</style>

      <Navbar />
      <div className="search-page">
        {/* ══ HERO ══ */}
        <div className="search-hero">
          <div className="search-hero-title">⚡ FIND YOUR NEXT GAME</div>
          <form onSubmit={handleSearch}>
            <div className="search-bar-wrap">
              <input
                placeholder="Search by title, developer, genre..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
              <button type="submit">{loading ? '...' : 'SEARCH'}</button>
            </div>
          </form>

          {/* TABS */}
          <div className="search-tabs">
            <button className={`search-tab ${!recSearched && !searched ? 'active' : searched ? 'active' : ''}`}
              onClick={() => {}}>
              HASIL PENCARIAN
              {searched && <span style={{marginLeft:8, color:'#e63946', fontSize:'0.7rem'}}>({results.length})</span>}
            </button>
            <button className={`search-tab ${recSearched ? 'active' : ''}`}
              onClick={() => {}}>
              REKOMENDASI 
              {recSearched && <span style={{marginLeft:8, color:'#e63946', fontSize:'0.7rem'}}>({recResults.length})</span>}
            </button>
          </div>
        </div>

        <div className="search-content">

          {/* ══ FILTER REKOMENDASI ══ */}
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

          <div className="filter-section">
            <div className="filter-label"><span style={{background:'#4a90d9'}}/>FITUR GAME</div>
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
                  <span className="selection-label">Input Genre Game :</span>
                  {selGenres.map(g => <span key={g} className="sel-tag-genre">{g}</span>)}
                </div>
              )}
              {selFiturs.length > 0 && (
                <div className="selection-row">
                  <span className="selection-label">Another Feature Game :</span>
                  {selFiturs.map(f => <span key={f} className="sel-tag-fitur">{f}</span>)}
                </div>
              )}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="rec-actions">
            <button className="btn-rec" onClick={handleRecommend}
              disabled={recLoading || !hasSelection}>
              {recLoading ? '⏳ MEMPROSES...' : '🎯 CARI REKOMENDASI '}
            </button>
            {hasSelection && (
              <button className="btn-reset" onClick={() => {
                setSelGenres([]); setSelFiturs([])
                setRecResults([]); setRecSearched(false)
              }}>Reset Filter</button>
            )}
          </div>

          {/* ══ HASIL REKOMENDASI ══ */}
          {recSearched && (
            <>
              <div className="result-header">
                <div className="result-title">🎯 HASIL REKOMENDASI </div>
                <div className="result-count">{recResults.length} game ditemukan</div>
              </div>
              {recResults.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎮</div>
                  <p>Tidak ada game yang cocok.<br/>Coba pilih genre atau fitur yang berbeda!</p>
                </div>
              ) : (
                <div className="fav-grid">
                  {recResults.map(game => (
                    <div key={game.id} style={{position:'relative'}}>
                      {favIds.has(String(game.id)) && <div className="fav-badge">♥</div>}
                      <div className="sim-badge">{Math.round(game.similarity_score * 100)}%</div>
                      <GameCard game={game} onClick={setPopup} />
                    </div>
                  ))}
                </div>
              )}
              {searched && <div className="section-divider"/>}
            </>
          )}

          {/* ══ HASIL SEARCH ══ */}
          {searched && (
            <>
              <div className="result-header">
                <div className="result-title">🔍 HASIL PENCARIAN</div>
                <div className="result-count">{results.length} hasil untuk "{keyword}"</div>
              </div>
              {results.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <p>Game "{keyword}" tidak ditemukan.</p>
                </div>
              ) : (
                <div className="fav-grid">
                  {results.map(game => (
                    <div key={game.id} style={{position:'relative'}}>
                      {favIds.has(String(game.id)) && <div className="fav-badge">♥</div>}
                      <GameCard game={game} onClick={setPopup} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* EMPTY STATE awal */}
          {!searched && !recSearched && (
            <div style={{textAlign:'center', padding:'60px 0', color:'#333'}}>
              <div style={{fontSize:'3rem', marginBottom:16}}>🎮</div>
              <div style={{fontFamily:'Orbitron', fontSize:'0.8rem', letterSpacing:3, color:'#333'}}>
                SEARCH GAME ATAU PILIH GENRE & FITUR DI ATAS
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
      {popup && <GamePopup game={popup} favIds={favIds} onClose={() => setPopup(null)} onFavChange={handleFavChange} />}
    </>
  )
}