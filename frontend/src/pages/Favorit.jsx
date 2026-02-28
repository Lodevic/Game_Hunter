import { useState, useEffect } from 'react'
import Navbar    from '../components/Navbar'
import Footer    from '../components/Footer'
import GameCard  from '../components/GameCard'
import GamePopup from '../components/GamePopup'
import { favoritAPI } from '../services/api'

export default function Favorit() {
  const [games,   setGames]   = useState([])
  const [favIds,  setFavIds]  = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [popup,   setPopup]   = useState(null)

  useEffect(() => {
    favoritAPI.getAll()
      .then(data => {
        setGames(data.games)
        setFavIds(new Set(data.games.map(g => String(g.id))))
      })
      .finally(() => setLoading(false))
  }, [])

  function handleFavChange(gameId, status) {
    if (status === 'removed') {
      setGames(prev => prev.filter(g => String(g.id) !== String(gameId)))
      setFavIds(prev => { const n = new Set(prev); n.delete(String(gameId)); return n })
    }
  }

  if (loading) return <div className="page-loading">⏳ Loading...</div>

  return (
    <>
      <Navbar />
      <div className="main">
        <div className="section-title" style={{color:'#e63946', fontFamily:'Orbitron', marginBottom:8}}>❤️ FAVORIT GAME</div>
        <div className="section-sub">{games.length} game tersimpan</div>
        {games.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">♡</div>
            <p>Kamu belum punya game favorit.<br/>Klik ♥ Favorit di popup game untuk menambahkan!</p>
          </div>
        ) : (
          <div className="fav-grid">
            {games.map(game => (
              <div key={game.id} style={{ position: 'relative' }}>
                <div className="fav-badge">♥</div>
                <GameCard game={game} onClick={setPopup} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
      {popup && <GamePopup game={popup} favIds={favIds} onClose={() => setPopup(null)} onFavChange={handleFavChange} />}
    </>
  )
}