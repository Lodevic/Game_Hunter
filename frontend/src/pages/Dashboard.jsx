import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import Navbar    from '../components/Navbar'
import Footer    from '../components/Footer'
import GameCard  from '../components/GameCard'
import GamePopup from '../components/GamePopup'
import { dashboardAPI, favoritAPI } from '../services/api'
import PageLoading from '../components/PageLoading'

// SVG icons — putih, clean
const IconStar     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
const IconChat     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconHeart    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconFree     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
const IconGamepad  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5S19.33 12 18.5 12z"/></svg>
const IconLoading  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>

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

  useEffect(() => {
    if (!user) return
    fetch('/api/profile/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.image && d.image.startsWith('data:image')) setProfileImg(d.image)
      })
      .catch(() => {})
  }, [user])

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
    { icon: <IconStar/>,    label: 'TOP RATED GAMES',   badge: 'HIGHEST RATING', games: data.top_rating },
    { icon: <IconChat/>,    label: 'MOST TALKED ABOUT', badge: 'TRENDING',       games: data.most_reviewed },
    { icon: <IconHeart/>,   label: "USER'S CHOICE",     badge: 'MOST LIKED',     games: data.most_liked },
    { icon: <IconFree/>,    label: 'BEST FREE GAMES',   badge: 'FREE TO PLAY',   games: data.free_games },
    { icon: <IconGamepad/>, label: 'EASY TO PLAY',      badge: 'BEGINNER',       games: data.easy_games },
  ] : []

  if (loading) return <PageLoading />

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
            <div className="section-title" style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{color:'#e63946', display:'flex', alignItems:'center'}}>{sec.icon}</span>
              {sec.label}
              <span className="badge">{sec.badge}</span>
            </div>
            <div className="games-row">
              {sec.games.map(game => (
                <div key={game.id} style={{position:'relative', flexShrink:0}}>
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
        <GamePopup game={popup} favIds={favIds}
          onClose={() => setPopup(null)} onFavChange={handleFavChange}/>
      )}
    </>
  )
}