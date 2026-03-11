import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar    from '../components/Navbar'
import Footer    from '../components/Footer'
import GameCard  from '../components/GameCard'
import GamePopup from '../components/GamePopup'
import { searchAPI, favoritAPI } from '../services/api'

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function Search() {
  const [searchParams] = useSearchParams()

  const [keyword,  setKeyword]  = useState('')
  const [results,  setResults]  = useState([])
  const [searched, setSearched] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [popup,    setPopup]    = useState(null)
  const [favIds,   setFavIds]   = useState(new Set())

  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q.trim()) {
      setKeyword(q.trim())
      runSearch(q.trim())
    }
  }, [searchParams])

  async function runSearch(q) {
    setLoading(true)
    const [res, fav] = await Promise.all([searchAPI.search(q), favoritAPI.getIds()])
    setResults(res.results)
    setFavIds(new Set(fav.favorites.map(String)))
    setSearched(true)
    setLoading(false)
  }

  function handleFavChange(gameId, status) {
    setFavIds(prev => {
      const next = new Set(prev)
      status === 'added' ? next.add(String(gameId)) : next.delete(String(gameId))
      return next
    })
  }

  return (
    <>
      <style>{`
        .search-page { min-height: 100vh; padding: 40px 60px; }
        .search-page-title {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.75rem; font-weight: 900;
          letter-spacing: 4px; color: #e63946;
          margin-bottom: 32px;
        }
        .result-header {
          display: flex; align-items: baseline; gap: 16px;
          margin-bottom: 24px; padding-bottom: 16px;
          border-bottom: 1px solid #1a1a1a;
        }
        .result-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem; font-weight: 900;
          letter-spacing: 3px; color: #fff;
        }
        .result-count {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.9rem; color: #555; font-weight: 600;
        }
      `}</style>

      <Navbar />
      <div className="search-page">

        <div className="search-page-title">
          <IconSearch />
          SEARCH GAME
        </div>

        {loading && (
          <div style={{textAlign:'center', padding:'60px 0', color:'#555'}}>
            <div style={{fontFamily:'Orbitron', fontSize:'0.8rem', letterSpacing:3}}>MENCARI...</div>
          </div>
        )}

        {searched && !loading && (
          <>
            <div className="result-header">
              <div className="result-title">HASIL PENCARIAN</div>
              <div className="result-count">{results.length} hasil untuk "{keyword}"</div>
            </div>
            {results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <IconSearch />
                </div>
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

        {!searched && !loading && (
          <div style={{textAlign:'center', padding:'80px 0', color:'#333'}}>
            <div style={{marginBottom:16, color:'#2a2a2a'}}>
              <IconSearch />
            </div>
            <div style={{fontFamily:'Orbitron', fontSize:'0.8rem', letterSpacing:3, color:'#333'}}>
              KETIK NAMA GAME DI SEARCH BAR ATAS UNTUK MENCARI
            </div>
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