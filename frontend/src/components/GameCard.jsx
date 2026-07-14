export default function GameCard({ game, onClick, size = 'normal' }) {
  const isPopular = size === 'popular'

  const cardWidth   = isPopular ? 260 : 220
  const coverHeight = isPopular ? 195 : 165   // 3:4 ratio tetap
  const namePad     = isPopular ? '8px 12px 4px' : '8px 10px 4px'
  const ratingPad   = isPopular ? '2px 12px 10px' : '2px 10px 10px'
  const nameSz      = isPopular ? '0.9rem' : '0.85rem'
  const ratingSz    = isPopular ? '0.82rem' : '0.78rem'
  const spanSz      = isPopular ? '0.65rem' : '0.6rem'

  return (
    <>
      <style>{`
        .game-card, .game-card-popular {
          background: #141414;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #1f1f1f;
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s;
          flex-shrink: 0;
        }
        .game-card { width: 220px; }
        .game-card-popular { width: 260px; }
        .game-card:hover, .game-card-popular:hover {
          transform: translateY(-4px);
          border-color: #e63946;
        }
        .game-cover-wrap {
          width: 100%;
          position: relative;
          overflow: hidden;
          background-color: #1a1a1a;
        }
        .game-cover-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }
        .game-cover-wrap .no-img-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1a1a1a 0%, #222 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-size: 2rem;
        }
        .game-cover-wrap .cover-title {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 18px 8px 6px;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          letter-spacing: 1px; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .game-name-text {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          color: #ccc;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .game-rating-text {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          color: #888;
        }
        .fav-badge {
          position: absolute; top: 6px; right: 6px; z-index: 5;
          background: rgba(230,57,70,0.9);
          color: #fff; font-size: 0.65rem;
          padding: 2px 6px; border-radius: 4px;
          font-weight: 900;
        }
      `}</style>

      <div
        className={isPopular ? 'game-card-popular' : 'game-card'}
        style={{ width: cardWidth }}
        onClick={() => onClick(game)}
      >
        {/* Cover Image — tinggi tetap, tidak bergantung pada aspect-ratio */}
        <div className="game-cover-wrap" style={{ height: coverHeight }}>
          {game.image ? (
            <img
              src={game.image}
              alt={game.name}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            />
          ) : null}
          {/* Fallback kalau gambar tidak ada / gagal load */}
          <div
            className="no-img-placeholder"
            style={{ display: game.image ? 'none' : 'flex', height: coverHeight }}
          >
            🎮
          </div>
          <div className="cover-title" style={{ fontSize: spanSz }}>
            {game.name?.toUpperCase()}
          </div>
        </div>

        {/* Info */}
        <div
          className="game-name-text"
          style={{ padding: namePad, fontSize: nameSz }}
        >
          {game.name}
        </div>
        <div
          className="game-rating-text"
          style={{ padding: ratingPad, fontSize: ratingSz }}
        >
          ⭐ {game.rating}
        </div>
      </div>
    </>
  )
}