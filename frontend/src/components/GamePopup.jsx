import { useState, useEffect, useRef } from 'react'
import { favoritAPI } from '../services/api'

const RAWG_KEY = '8d72c45a17f746309288d44c79608066'

export default function GamePopup({ game, favIds, onClose, onFavChange }) {
  const [saving,       setSaving]       = useState(false)
  const [images,       setImages]       = useState(game?.image ? [game.image] : [])
  const [activeIdx,    setActiveIdx]    = useState(0)
  const [loadingShots, setLoadingShots] = useState(true)
  const timerRef = useRef(null)

  const isFav = favIds.has(String(game?.id))
  if (!game) return null

  function startTimer(len) {
    clearInterval(timerRef.current)
    if (len <= 1) return
    timerRef.current = setInterval(() => {
      setActiveIdx(i => (i + 1) % len)
    }, 5000)
  }

  function goTo(idx) {
    setActiveIdx(idx)
    startTimer(images.length)
  }

  useEffect(() => {
    const base = game.image ? [game.image] : []
    setImages(base)
    setActiveIdx(0)
    setLoadingShots(true)

    async function fetchScreenshots() {
      try {
        const searchRes = await fetch(
          `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(game.name)}&page_size=1&search_precise=true`
        )
        const searchData = await searchRes.json()
        const rawgGame = searchData.results?.[0]
        if (!rawgGame) return
        const shotRes = await fetch(
          `https://api.rawg.io/api/games/${rawgGame.id}/screenshots?key=${RAWG_KEY}&page_size=5`
        )
        const shotData = await shotRes.json()
        const shots = shotData.results?.map(s => s.image) || []
        const all = [...base, ...shots]
        setImages(all)
        startTimer(all.length)
      } catch(e) { console.error(e) }
      finally { setLoadingShots(false) }
    }

    fetchScreenshots()
    return () => clearInterval(timerRef.current)
  }, [game.id])

  async function toggleFav() {
    setSaving(true)
    try {
      const res = await favoritAPI.toggle(game.id)
      onFavChange(game.id, res.status)
    } catch(e) {}
    setSaving(false)
  }

  const tags   = (game.genre || '-').split(',').map(t => t.trim()).filter(Boolean)
  const fiturs = (game.fitur  || '-').split(',').map(f => f.trim()).filter(Boolean)
  const steamUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`

  return (
    <div className="popup-overlay show"
      onClick={e => e.target.className.includes('popup-overlay') && onClose()}>
      <style>{`
        @keyframes gpFade { from{opacity:0;transform:scale(1.015)} to{opacity:1;transform:scale(1)} }
        @keyframes gpSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes timerBar { from{width:0%} to{width:100%} }

        .popup-overlay.show {
          position:fixed; inset:0; z-index:500;
          background:rgba(0,0,0,0.88);
          display:flex; align-items:center; justify-content:center;
          padding:16px;
        }
        .gp-modal {
          background:#141414;
          border:1px solid #282828;
          border-top:3px solid #e63946;
          border-radius:14px;
          width:100%; max-width:1020px;
          max-height:92vh;
          display:grid; grid-template-columns:290px 1fr;
          overflow:hidden;
          box-shadow:0 40px 120px rgba(0,0,0,0.95);
          position:relative;
        }

        .gp-close {
          position:absolute; top:14px; right:14px; z-index:20;
          width:34px; height:34px; border-radius:50%;
          background:rgba(20,20,20,0.9); border:1px solid #333;
          color:#888; font-size:0.85rem; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all 0.2s;
        }
        .gp-close:hover { background:#e63946; border-color:#e63946; color:#fff; }

        /* KOLOM KIRI */
        .gp-left {
          border-right:1px solid #1e1e1e;
          overflow-y:auto; overflow-x:hidden;
          scrollbar-width:thin; scrollbar-color:#1e1e1e transparent;
          display:flex; flex-direction:column;
        }
        .gp-left::-webkit-scrollbar { width:3px; }
        .gp-left::-webkit-scrollbar-thumb { background:#1e1e1e; border-radius:3px; }

        /* === PERUBAHAN: cover punya margin 12px di semua sisi, sudut rounded === */
        .gp-cover {
          margin: 12px 12px 0 12px;
          aspect-ratio:4/3; position:relative;
          background:#0d0d0d; flex-shrink:0;
          border-radius: 10px; overflow: hidden;
        }
        .gp-cover img { width:100%; height:100%; object-fit:cover; display:block; }
        .gp-cover-label {
          position:absolute; bottom:0; left:0; right:0;
          padding:28px 14px 10px;
          background:linear-gradient(transparent,rgba(0,0,0,0.88));
          font-family:'Orbitron',sans-serif;
          font-size:0.58rem; font-weight:900; letter-spacing:2px; color:#fff;
        }

        .gp-left-body { padding:16px 18px 24px; display:flex; flex-direction:column; }

        .gp-game-name {
          font-family:'Orbitron',sans-serif; font-size:0.82rem;
          font-weight:900; color:#fff; margin-bottom:14px; line-height:1.4;
        }
        .gp-btn-fav {
          width:100%; padding:11px; border-radius:8px; margin-bottom:8px;
          font-family:'Rajdhani',sans-serif; font-size:0.92rem; font-weight:700;
          cursor:pointer; transition:all 0.2s;
          border:1.5px solid #e63946; background:transparent; color:#e63946;
          display:flex; align-items:center; justify-content:center; gap:6px;
        }
        .gp-btn-fav:hover,.gp-btn-fav.saved { background:#e63946; color:#fff; }
        .gp-btn-fav:disabled { opacity:0.45; cursor:not-allowed; }
        .gp-btn-steam {
          width:100%; padding:11px; border-radius:8px; margin-bottom:18px;
          font-family:'Rajdhani',sans-serif; font-size:0.92rem; font-weight:700;
          cursor:pointer; transition:all 0.2s;
          border:1.5px solid #1b2838; background:#1b2838; color:#c6d4df;
          display:flex; align-items:center; justify-content:center; gap:6px;
          text-decoration:none;
        }
        .gp-btn-steam:hover { background:#2a475e; border-color:#2a475e; }
        .gp-btn-steam svg { width:15px; height:15px; fill:currentColor; flex-shrink:0; }

        .gp-divider { height:1px; background:#1a1a1a; margin-bottom:14px; }

        .gp-info-row {
          display:flex; justify-content:space-between; align-items:baseline;
          padding:8px 0; border-bottom:1px solid #181818; gap:8px;
        }
        .gp-info-row:last-of-type { border-bottom:none; }
        .gp-info-label {
          font-family:'Rajdhani',sans-serif; font-size:0.72rem;
          font-weight:700; color:#444; letter-spacing:0.8px;
          text-transform:uppercase; white-space:nowrap; flex-shrink:0;
        }
        .gp-info-value {
          font-family:'Rajdhani',sans-serif; font-size:0.88rem;
          font-weight:700; color:#bbb; text-align:right;
        }

        /* KOLOM KANAN */
        .gp-right {
          display:flex; flex-direction:column;
          overflow-y:auto; overflow-x:hidden;
          scrollbar-width:thin; scrollbar-color:#1e1e1e transparent;
        }
        .gp-right::-webkit-scrollbar { width:3px; }
        .gp-right::-webkit-scrollbar-thumb { background:#1e1e1e; border-radius:3px; }

        .gp-slideshow {
          width:100%; aspect-ratio:16/9;
          position:relative; overflow:hidden;
          background:#0d0d0d; flex-shrink:0;
        }
        .gp-slide-img {
          width:100%; height:100%; object-fit:cover; display:block;
          animation:gpFade 0.4s ease;
        }
        .gp-slide-empty {
          width:100%; height:100%;
          display:flex; align-items:center; justify-content:center;
        }
        .gp-spin {
          width:32px; height:32px;
          border:3px solid rgba(230,57,70,0.2);
          border-top-color:#e63946; border-radius:50%;
          animation:gpSpin 0.8s linear infinite;
        }
        .gp-arrow {
          position:absolute; top:50%; transform:translateY(-50%);
          width:36px; height:36px; border-radius:50%;
          background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1);
          color:#fff; cursor:pointer; font-size:1.2rem;
          display:flex; align-items:center; justify-content:center;
          transition:background 0.2s; z-index:3;
        }
        .gp-arrow:hover { background:#e63946; border-color:#e63946; }
        .gp-arrow-l { left:12px; }
        .gp-arrow-r { right:12px; }

        .gp-bottom-bar {
          flex-shrink:0; padding:8px 16px 6px;
          background:#0d0d0d;
          display:flex; flex-direction:column; gap:7px; align-items:center;
          border-bottom:1px solid #1a1a1a;
        }
        .gp-dots { display:flex; gap:5px; }
        .gp-dot {
          height:5px; border-radius:3px; border:none; padding:0; cursor:pointer;
          transition:all 0.3s;
        }
        .gp-dot.active   { width:20px; background:#e63946; }
        .gp-dot.inactive { width:5px;  background:rgba(255,255,255,0.2); }
        .gp-timer-track {
          width:100%; height:2px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden;
        }
        .gp-timer-fill {
          height:100%; background:#e63946; border-radius:2px;
          animation:timerBar 5s linear;
        }

        .gp-right-body { padding:18px 20px 24px; }

        .gp-section-title {
          font-family:'Orbitron',sans-serif; font-size:0.6rem;
          font-weight:900; letter-spacing:3px; color:#3a3a3a;
          margin-bottom:10px;
          display:flex; align-items:center; gap:8px;
        }
        .gp-section-title::after { content:''; flex:1; height:1px; background:#1a1a1a; }
        .gp-tag-wrap { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:18px; }
        .gp-tag {
          padding:4px 11px; border-radius:4px;
          border:1px solid #242424; background:#0f0f0f;
          font-family:'Rajdhani',sans-serif; font-size:0.8rem; font-weight:700; color:#555;
        }
        .gp-fitur {
          padding:4px 11px; border-radius:4px;
          border:1px solid #162030; background:#091018;
          font-family:'Rajdhani',sans-serif; font-size:0.8rem; font-weight:700; color:#4a80c4;
        }
      `}</style>

      <div className="gp-modal">
        <button className="gp-close" onClick={onClose}>✕</button>

        {/* KIRI */}
        <div className="gp-left">
          <div className="gp-cover">
            {game.image
              ? <img src={game.image} alt={game.name}/>
              : <div style={{width:'100%',height:'100%',background:'#111'}}/>
            }
            <div className="gp-cover-label">{game.name?.toUpperCase()}</div>
          </div>

          <div className="gp-left-body">
            <div className="gp-game-name">{game.name}</div>

            <button className={`gp-btn-fav ${isFav ? 'saved' : ''}`}
              onClick={toggleFav} disabled={saving}>
              ♥ {isFav ? 'Tersimpan!' : 'Favorit'}
            </button>
            <a className="gp-btn-steam" href={steamUrl} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.52 3.73 10.17 8.84 11.54L12.53 18c.16-.61.1-1.26-.2-1.84l-1.18-2.28a3.27 3.27 0 0 0-1.42-3.7 3.27 3.27 0 0 0-4.46 1.2L3.5 9.5A8.5 8.5 0 0 1 12 3.5a8.5 8.5 0 0 1 8.5 8.5 8.5 8.5 0 0 1-8.5 8.5h-.15l-3.2 3.27A12 12 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0zm-1.77 15.5a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2z"/></svg>
              Buka di Steam
            </a>

            <div className="gp-divider"/>

            {[
              ['Developer',    game.developer],
              ['Tanggal Rilis',game.release],
              ['Harga',        game.price],
              ['Rating',       game.rating],
              ['Rating Usia',  game.usia],
              ['Platform',     game.platform],
            ].map(([label, val]) => (
              <div className="gp-info-row" key={label}>
                <span className="gp-info-label">{label}</span>
                <span className="gp-info-value">{val || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KANAN */}
        <div className="gp-right">
          <div className="gp-slideshow">
            {images.length > 0 ? (
              <img key={activeIdx} className="gp-slide-img" src={images[activeIdx]} alt=""/>
            ) : (
              <div className="gp-slide-empty">
                {loadingShots
                  ? <div className="gp-spin"/>
                  : <span style={{color:'#2a2a2a',fontFamily:'Rajdhani',fontSize:'0.85rem'}}>No Image</span>
                }
              </div>
            )}
            {images.length > 1 && (
              <>
                <button className="gp-arrow gp-arrow-l"
                  onClick={() => goTo((activeIdx - 1 + images.length) % images.length)}>‹</button>
                <button className="gp-arrow gp-arrow-r"
                  onClick={() => goTo((activeIdx + 1) % images.length)}>›</button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="gp-bottom-bar">
              <div className="gp-dots">
                {images.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={`gp-dot ${i === activeIdx ? 'active' : 'inactive'}`}/>
                ))}
              </div>
              <div className="gp-timer-track">
                <div key={activeIdx} className="gp-timer-fill"/>
              </div>
            </div>
          )}

          <div className="gp-right-body">
            <div className="gp-section-title">Genre / Tag</div>
            <div className="gp-tag-wrap">
              {tags.map(t => <span key={t} className="gp-tag">{t}</span>)}
            </div>

            <div className="gp-section-title">Fitur Gameplay</div>
            <div className="gp-tag-wrap">
              {fiturs.map(f => <span key={f} className="gp-fitur">{f}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}