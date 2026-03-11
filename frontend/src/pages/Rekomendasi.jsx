import { useState, useEffect } from 'react'
import Navbar      from '../components/Navbar'
import Footer      from '../components/Footer'
import GameCard    from '../components/GameCard'
import GamePopup   from '../components/GamePopup'
import PageLoading from '../components/PageLoading'
import { rekomendasiAPI, favoritAPI } from '../services/api'

export default function Rekomendasi() {
  const [sections, setSections] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [popup,    setPopup]    = useState(null)
  const [favIds,   setFavIds]   = useState(new Set())

  useEffect(() => {
    Promise.all([rekomendasiAPI.get(), favoritAPI.getIds()])
      .then(([rek, fav]) => {
        setSections(rek.sections)
        setFavIds(new Set(fav.favorites.map(String)))
      })
      .finally(() => setLoading(false))
  }, [])

  function handleFavChange(gameId, status) {
    setFavIds(prev => {
      const next = new Set(prev)
      status === 'added' ? next.add(String(gameId)) : next.delete(String(gameId))
      return next
    })
  }

  if (loading) return <PageLoading />

  return (
    <>
      <Navbar />
      <div className="main">
        {sections.map(sec => (
          <div className="genre-section" key={sec.label}>
            <div className="section-title">
              {sec.label} <span className="badge">{sec.badge}</span>
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