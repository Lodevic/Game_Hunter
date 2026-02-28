import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import Navbar    from '../components/Navbar'
import Footer    from '../components/Footer'
import GameCard  from '../components/GameCard'
import GamePopup from '../components/GamePopup'
import { dashboardAPI, favoritAPI } from '../services/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [popup,      setPopup]      = useState(null)
  const [favIds,     setFavIds]     = useState(new Set())
  const [profileImg, setProfileImg] = useState(null)

  useEffect(() => {
    Promise.all([dashboardAPI.get(), favoritAPI.getIds()])
      .then(([dash, fav]) => {
        setData(dash)
        setFavIds(new Set(fav.favorites.map(String)))
      })
      .finally(() => setLoading(false))
  }, [])

  // Fetch foto profil saat pertama load
  useEffect(() => {
    if (!user) return
    fetch('/api/profile/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.image && d.image.startsWith('data:image')) setProfileImg(d.image)
      })
      .catch(() => {})
  }, [user])

  // ✅ Dengerin event dari Navbar saat profil di-update → langsung update tanpa reload
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.image) setProfileImg(e.detail.image)
    }
    window.addEventListener('profile-updated', handler)
    return () => window.removeEventListener('profile-updated', handler)
  }, [])

  function handleFavChange(gameId, status) {
    setFavIds(prev => {
      const next = new Set(prev)
      status === 'added' ? next.add(String(gameId)) : next.delete(String(gameId))
      return next
    })
  }

  const sections = data ? [
    { label: '⭐ TOP RATED GAMES',   badge: 'HIGHEST RATING', games: data.top_rating },
    { label: '💬 MOST TALKED ABOUT', badge: 'TRENDING',       games: data.most_reviewed },
    { label: "❤️ USER'S CHOICE",     badge: 'MOST LIKED',     games: data.most_liked },
    { label: '🆓 BEST FREE GAMES',   badge: 'FREE TO PLAY',   games: data.free_games },
    { label: '🎮 EASY TO PLAY',      badge: 'BEGINNER',       games: data.easy_games },
  ] : []

  if (loading) return <div className="page-loading">⏳ Loading...</div>

  return (
    <>
      <Navbar />
      <div className="welcome-banner">
        <div className="welcome-avatar">
          {profileImg
            ? <img src={profileImg} alt="avatar"
                style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}}/>
            : <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
          }
        </div>
        <div className="welcome-text">
          <h2>WELCOME BACK <span>{user?.name?.toUpperCase()}</span>,<br/>WHAT GAME ARE YOU LOOKING FOR TODAY?</h2>
        </div>
      </div>

      <div className="main">
        {sections.map(sec => sec.games?.length > 0 && (
          <div className="genre-section" key={sec.label}>
            <div className="section-title">
              {sec.label} <span className="badge">{sec.badge}</span>
            </div>
            <div className="games-row">
              {sec.games.map(game => (
                <div key={game.id} style={{ position: 'relative', flexShrink: 0 }}>
                  {favIds.has(String(game.id)) && <div className="fav-badge">♥</div>}
                  <GameCard game={game} onClick={setPopup} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Footer />
      {popup && (
        <GamePopup game={popup} favIds={favIds} onClose={() => setPopup(null)} onFavChange={handleFavChange} />
      )}
    </>
  )
}