import { useState, useEffect } from 'react'
import Navbar    from '../components/Navbar'
import Footer    from '../components/Footer'
import GameCard  from '../components/GameCard'
import GamePopup from '../components/GamePopup'
import { favoritAPI } from '../services/api'
import PageLoading from '../components/PageLoading'

const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

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

  async function handleFavChange(gameId, status) {
    if (status === 'removed') {
      // Hapus dari list
      setGames(prev => prev.filter(g => String(g.id) !== String(gameId)))
      setFavIds(prev => { const n = new Set(prev); n.delete(String(gameId)); return n })
    } else if (status === 'added') {
      // Tambah kembali — fetch data game dari API favorit terbaru
      setFavIds(prev => { const n = new Set(prev); n.add(String(gameId)); return n })
      try {
        const data = await favoritAPI.getAll()
        setGames(data.games)
        setFavIds(new Set(data.games.map(g => String(g.id))))
      } catch(e) {}
    }
  }

  if (loading) return <PageLoading />

  return (
    <>
      <Navbar />
      <div className="main">
        <div className="section-title" style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:8}}>
          <span style={{color:'#e63946', display:'flex', alignItems:'center'}}><IconHeart /></span>
          FAVORIT GAME
        </div>
        <div className="section-sub">{games.length} game tersimpan</div>

        {games.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconHeart /></div>
            <p>Kamu belum punya game favorit.<br/>Klik Favorit di popup game untuk menambahkan!</p>
          </div>
        ) : (
          <div className="fav-grid">
            {games.map(game => (
              <div key={game.id} style={{position:'relative'}}>
                <div className="fav-badge">♥</div>
                <GameCard game={game} onClick={setPopup} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      {popup && (
        <GamePopup game={popup} favIds={favIds}
          onClose={() => setPopup(null)} onFavChange={handleFavChange}/>
      )}
    </>
  )
}