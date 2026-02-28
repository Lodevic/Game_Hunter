import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

export default function LandingPage() {
  const navigate = useNavigate()

  const [bgImages,  setBgImages]  = useState([])
  const [popGames,  setPopGames]  = useState([])
  const [bgIndex,   setBgIndex]   = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [navActive, setNavActive] = useState('profilsistem')
  const scrollRef = useRef(null)

  useEffect(() => {
    fetch('/api/bg-images').then(r=>r.json()).then(d=>{ if(d.images?.length) setBgImages(d.images) }).catch(()=>{})
    fetch('/api/popular-games').then(r=>r.json()).then(d=>{ if(d.games?.length) setPopGames(d.games) }).catch(()=>{})
  }, [])

  useEffect(() => {
    if (!bgImages.length) return
    const t = setInterval(() => setBgIndex(i => (i+1) % Math.min(bgImages.length, 5)), 5000)
    return () => clearInterval(t)
  }, [bgImages])

  const navLinks = [
    { label:'Profil Sistem', id:'profil',  key:'profilsistem' },
    { label:'Fitur',         id:'fitur',   key:'fitur'        },
    { label:'Game Popular',  id:'popular', key:'gamepopular'  },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#0a0a0a;color:#fff;font-family:'Rajdhani',sans-serif}

        .ln-nav {
          position:sticky;top:0;z-index:100;
          display:flex;align-items:center;
          padding:0 32px;height:56px;
          background:#0a0a0a;border-bottom:1px solid #1a1a1a;
        }
        .ln-logo{font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;color:#fff;letter-spacing:2px;margin-right:auto;}
        .ln-navlinks{display:flex;gap:28px;align-items:center}
        .ln-navlink{font-family:'Rajdhani',sans-serif;font-size:0.9rem;font-weight:700;color:#666;background:none;border:none;cursor:pointer;letter-spacing:0.5px;transition:color 0.2s;}
        .ln-navlink.active{color:#e63946}
        .ln-navlink:hover{color:#fff}
        .ln-avatar{width:34px;height:34px;border-radius:50%;background:#1f1f1f;border:1.5px solid #2a2a2a;display:flex;align-items:center;justify-content:center;margin-left:16px;cursor:pointer;transition:border-color 0.2s;}
        .ln-avatar:hover{border-color:#e63946}
        .ln-avatar svg{width:18px;height:18px;color:#555}
        .ln-loginbtn{margin-left:10px;padding:7px 20px;background:transparent;border:1.5px solid #333;border-radius:20px;color:#888;font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.2s;}
        .ln-loginbtn:hover{border-color:#e63946;color:#e63946}

        .ln-hero{position:relative;width:100%;height:480px;overflow:hidden;background:#000;}
        .ln-slide{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.2s ease,transform 6s ease;transform:scale(1.05);}
        .ln-slide.active{opacity:1;transform:scale(1);}
        .ln-hero-shadow{position:absolute;inset:0;z-index:2;background:linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.05) 40%,rgba(0,0,0,0.65) 75%,rgba(10,10,10,1) 100%);}
        .ln-hero-sides{position:absolute;inset:0;z-index:2;background:linear-gradient(to right,rgba(0,0,0,0.55) 0%,transparent 30%,transparent 70%,rgba(0,0,0,0.55) 100%);}
        .ln-hero-dots{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);z-index:5;display:flex;gap:8px;}
        .ln-hero-dot{width:24px;height:3px;border-radius:3px;background:rgba(255,255,255,0.2);border:none;cursor:pointer;transition:all 0.3s;}
        .ln-hero-dot.active{background:#e63946;width:40px;box-shadow:0 0 8px rgba(230,57,70,0.6);}

        .ln-cta{text-align:center;padding:64px 32px 56px;background:linear-gradient(180deg,#0a0a0a 0%,#0f0f0f 100%);}
        .ln-cta-title{font-size:2.2rem;font-weight:900;color:#fff;margin-bottom:10px;font-family:'Orbitron',sans-serif;letter-spacing:1px;}
        .ln-cta-sub{font-size:1rem;color:#e63946;font-weight:700;letter-spacing:0.5px;margin-bottom:36px;font-style:italic;}
        .ln-cta-btn{display:inline-block;padding:14px 40px;background:transparent;border:2px solid #555;border-radius:4px;color:#ccc;font-family:'Orbitron',sans-serif;font-size:0.85rem;font-weight:700;letter-spacing:2px;cursor:pointer;transition:all 0.2s;}
        .ln-cta-btn:hover{border-color:#e63946;color:#e63946}

        .ln-stats{display:flex;gap:24px;padding:0 32px 64px;justify-content:center;background:#0f0f0f;}
        .ln-stat-card{flex:1;max-width:220px;background:#1a1a1a;border-radius:12px;padding:32px 20px;text-align:center;border:1px solid #222;}
        .ln-stat-icon{font-size:2.5rem;margin-bottom:12px;opacity:0.7}
        .ln-stat-num{font-family:'Orbitron',sans-serif;font-size:1.3rem;font-weight:900;color:#fff;margin-bottom:6px}
        .ln-stat-desc{font-size:0.85rem;color:#555;font-weight:600;line-height:1.4}

        .ln-feature{display:flex;align-items:center;gap:48px;padding:64px;background:#0a0a0a;border-top:1px solid #111;border-bottom:1px solid #111;}
        .ln-feature-body{font-size:0.92rem;color:#666;font-weight:600;line-height:1.9;text-transform:uppercase;letter-spacing:0.3px;}

        .ln-popular{padding:48px 32px;background:#0a0a0a}
        .ln-popular-title{font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:900;color:#e63946;letter-spacing:1px;margin-bottom:24px;}
        .ln-games-row{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px;}
        .ln-games-row::-webkit-scrollbar{height:4px}
        .ln-games-row::-webkit-scrollbar-track{background:#111}
        .ln-games-row::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px}
        .ln-game-card{min-width:160px;max-width:160px;background:#141414;border-radius:10px;overflow:hidden;border:1px solid #1f1f1f;cursor:pointer;transition:transform 0.2s,border-color 0.2s;flex-shrink:0;}
        .ln-game-card:hover{transform:translateY(-4px);border-color:#e63946}
        .ln-game-card img{width:100%;height:110px;object-fit:cover;display:block}
        .ln-game-card-name{padding:10px;font-size:0.82rem;font-weight:700;color:#ccc;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

        /* popup */
        .ln-overlay{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.78);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.15s ease;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .ln-popup{background:#141414;border:1px solid #2a2a2a;border-radius:16px;width:360px;padding:40px 32px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,0.9);animation:slideUp 0.2s ease;}
        .ln-popup-icon{font-size:2.8rem;margin-bottom:16px}
        .ln-popup-title{font-family:'Orbitron',sans-serif;font-size:0.95rem;font-weight:900;color:#fff;letter-spacing:1px;margin-bottom:8px;}
        .ln-popup-sub{font-size:0.9rem;color:#555;font-weight:600;margin-bottom:28px;line-height:1.5}
        .ln-popup-actions{display:flex;gap:12px}
        .ln-popup-cancel{flex:1;padding:12px;background:transparent;border:1.5px solid #222;border-radius:8px;color:#555;font-family:'Rajdhani',sans-serif;font-size:0.95rem;font-weight:700;cursor:pointer;transition:all 0.2s;}
        .ln-popup-cancel:hover{border-color:#444;color:#888}
        .ln-popup-go{flex:1;padding:12px;background:#e63946;border:none;border-radius:8px;color:#fff;font-family:'Orbitron',sans-serif;font-size:0.72rem;font-weight:900;letter-spacing:1.5px;cursor:pointer;transition:all 0.2s;}
        .ln-popup-go:hover{background:#c62d3a}
      `}</style>

      {/* NAVBAR */}
      <nav className="ln-nav">
        <div className="ln-logo" style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <img src="/Logo.png" alt="logo" style={{width:'28px',height:'28px',objectFit:'contain'}}/>
          GAME HUNTER
        </div>
        <div className="ln-navlinks">
          {navLinks.map(l => (
            <button key={l.key}
              className={`ln-navlink ${navActive===l.key?'active':''}`}
              onClick={() => { setNavActive(l.key); document.getElementById(l.id)?.scrollIntoView({behavior:'smooth'}) }}
            >{l.label}</button>
          ))}
          <div className="ln-avatar" onClick={() => navigate('/login')}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          </div>
          <button className="ln-loginbtn" onClick={() => navigate('/login')}>Login</button>
        </div>
      </nav>

      {/* HERO SLIDESHOW */}
      <div id="profil" className="ln-hero">
        {bgImages.slice(0,5).map((url,i) => (
          <div key={i} className={`ln-slide ${i===bgIndex?'active':''}`} style={{backgroundImage:`url(${url})`}}/>
        ))}
        {bgImages.length===0 && <div className="ln-slide active" style={{background:'#111'}}/>}
        <div className="ln-hero-shadow"/>
        <div className="ln-hero-sides"/>
        <div className="ln-hero-dots">
          {bgImages.slice(0,5).map((_,i) => (
            <button key={i} className={`ln-hero-dot ${i===bgIndex?'active':''}`} onClick={() => setBgIndex(i)}/>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="ln-cta">
        <div className="ln-cta-title">Level Up Your Game Choices!</div>
        <div className="ln-cta-sub">Get accurate game recommendations based on favorite genres.</div>
        <button className="ln-cta-btn" onClick={() => setShowPopup(true)}>[ Start Playing ]</button>
      </section>

      {/* STATS */}
      <section className="ln-stats">
        <div className="ln-stat-card"><div className="ln-stat-icon">🎮</div><div className="ln-stat-num">2000 +</div><div className="ln-stat-desc">Popular Games Analyzed</div></div>
        <div className="ln-stat-card"><div className="ln-stat-icon">⚖️</div><div className="ln-stat-num">Advanced</div><div className="ln-stat-desc">Genre & Rating-Based Matching Engine</div></div>
        <div className="ln-stat-card"><div className="ln-stat-icon">👍</div><div className="ln-stat-num">Thousands</div><div className="ln-stat-desc">of Personalized Recommendations Delivered</div></div>
      </section>

      {/* FEATURE */}
      <section id="fitur" className="ln-feature">
        <div style={{
          minWidth:'320px', maxWidth:'480px', flex:'1',
          borderRadius:'12px', overflow:'hidden',
          flexShrink:0, border:'1px solid #2a2a2a'
        }}>
          <img
            src="/LP.gif"
            alt="Feature Demo"
            style={{width:'100%', height:'auto', display:'block'}}
          />
        </div>
        <p className="ln-feature-body">
          Our core feature, Genre-Based Recommendation, is designed to deliver a highly personalized
          content discovery experience. It first intelligently filters the library based on your
          preferred genres. For immediate access to the best content, all results are then automatically
          sorted by the highest rating by default. Furthermore, you can utilize our advanced filtering
          options to refine the selections further by choosing other specific features such as
          Single-Player, Multiplayer, Co-Op, or Cross-Platform capabilities, ensuring you find exactly
          what you're looking for.
        </p>
      </section>

      {/* POPULAR GAMES */}
      <section id="popular" className="ln-popular">
        <div className="ln-popular-title">Popular Game</div>
        <div className="ln-games-row" ref={scrollRef}>
          {popGames.map(game => (
            <div key={game.id} className="ln-game-card" onClick={() => setShowPopup(true)}>
              {game.image
                ? <img src={game.image} alt={game.name} onError={e=>e.target.style.display='none'}/>
                : <div style={{height:'110px',background:'#222',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem'}}>🎮</div>
              }
              <div className="ln-game-card-name">{game.name}</div>
            </div>
          ))}
          {popGames.length===0 && [1,2,3,4,5,6,7,8,9,10].map(i=>(
            <div key={i} className="ln-game-card">
              <div style={{height:'110px',background:'#1a1a1a'}}/>
              <div className="ln-game-card-name" style={{color:'#333'}}>Loading...</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER — pakai komponen yang sama dengan halaman lain */}
      <Footer />

      {/* POPUP: harus login dulu */}
      {showPopup && (
        <div className="ln-overlay" onClick={() => setShowPopup(false)}>
          <div className="ln-popup" onClick={e=>e.stopPropagation()}>
            <div className="ln-popup-icon">🔐</div>
            <div className="ln-popup-title">LOGIN DIPERLUKAN</div>
            <div className="ln-popup-sub">Kamu harus login terlebih dahulu untuk mengakses fitur ini dan melihat detail game.</div>
            <div className="ln-popup-actions">
              <button className="ln-popup-cancel" onClick={() => setShowPopup(false)}>Batal</button>
              <button className="ln-popup-go" onClick={() => navigate('/login')}>MASUK / DAFTAR →</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}