import { useState } from 'react'
import { favoritAPI } from '../services/api'

export default function GamePopup({ game, favIds, onClose, onFavChange }) {
  const [saving, setSaving] = useState(false)
  const isFav = favIds.has(String(game?.id))

  if (!game) return null

  async function toggleFav() {
    setSaving(true)
    try {
      const res = await favoritAPI.toggle(game.id)
      onFavChange(game.id, res.status)
    } catch(e) {}
    setSaving(false)
  }

  const tags   = (game.genre || '-').split(',')
  const fiturs = (game.fitur || '-').split(',')
  const steamUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`

  return (
    <div className="popup-overlay show" onClick={(e) => e.target.className.includes('popup-overlay') && onClose()}>
      <div className="popup">
        <button className="popup-close" onClick={onClose}>✕</button>
        <div className="popup-body">
          <div className="popup-left">
            <div
              className="popup-cover"
              style={game.image ? { backgroundImage: `url('${game.image}')` } : {}}
            >
              <span>{game.name?.toUpperCase()}</span>
            </div>
            <div className="popup-game-title">{game.name}</div>
            <button
              className={`btn-favorit ${isFav ? 'saved' : ''}`}
              onClick={toggleFav}
              disabled={saving}
            >
              {isFav ? '♥ Tersimpan!' : '♥ Favorit'}
            </button>
            <a className="btn-steam" href={steamUrl} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.52 3.73 10.17 8.84 11.54L12.53 18c.16-.61.1-1.26-.2-1.84l-1.18-2.28a3.27 3.27 0 0 0-1.42-3.7 3.27 3.27 0 0 0-4.46 1.2L3.5 9.5A8.5 8.5 0 0 1 12 3.5a8.5 8.5 0 0 1 8.5 8.5 8.5 8.5 0 0 1-8.5 8.5h-.15l-3.2 3.27A12 12 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0zm-1.77 15.5a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2z"/></svg>
              Buka di Steam
            </a>
          </div>
          <div className="popup-info">
            {[
              ['Developer',    game.developer],
              ['Tanggal Rilis',game.release],
              ['Harga',        game.price],
              ['Rating',       game.rating],
              ['Rating Usia',  game.usia],
              ['Platform',     game.platform],
            ].map(([label, val]) => (
              <div className="popup-info-row" key={label}>
                <span className="popup-info-label">{label}</span>
                <span className="popup-info-value">{val || '-'}</span>
              </div>
            ))}
            <div className="popup-divider"/>
            <div className="popup-tag-title">Genre / Tag</div>
            <div className="popup-tags">
              {tags.map(t => <span key={t} className="popup-tag">{t.trim()}</span>)}
            </div>
            <div className="popup-divider"/>
            <div className="popup-tag-title">Fitur Gameplay</div>
            <div className="popup-fitur-list">
              {fiturs.map(f => <span key={f} className="popup-fitur-item">{f.trim()}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}