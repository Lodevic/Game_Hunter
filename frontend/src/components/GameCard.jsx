export default function GameCard({ game, onClick, size = 'normal' }) {
  const isPopular = size === 'popular'

  return (
    <>
      <style>{`
        .game-card {
          width: 220px;
          background: #141414;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #1f1f1f;
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s;
          flex-shrink: 0;
        }
        .game-card:hover {
          transform: translateY(-4px);
          border-color: #e63946;
        }
        .game-card-popular {
          width: 260px;
          background: #141414;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #1f1f1f;
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s;
          flex-shrink: 0;
        }
        .game-card-popular:hover {
          transform: translateY(-4px);
          border-color: #e63946;
        }

        .game-cover {
          width: 100%;
          aspect-ratio: 4/3;
          background-size: cover;
          background-position: center top;
          background-color: #1a1a1a;
          position: relative;
          display: flex; align-items: flex-end;
        }
        .game-cover-popular {
          width: 100%;
          aspect-ratio: 4/3;
          background-size: cover;
          background-position: center top;
          background-color: #1a1a1a;
          position: relative;
          display: flex; align-items: flex-end;
        }
        .game-cover.no-image,
        .game-cover-popular.no-image {
          background-color: #1a1a1a;
        }
        .game-cover span,
        .game-cover-popular span {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 18px 8px 6px;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          font-family: 'Orbitron', sans-serif;
          font-size: 0.6rem; font-weight: 900;
          letter-spacing: 1px; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .game-name {
          padding: 8px 10px 4px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.85rem; font-weight: 700;
          color: #ccc;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .game-name-popular {
          padding: 8px 12px 4px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.9rem; font-weight: 700;
          color: #ccc;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .game-rating {
          padding: 2px 10px 10px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.78rem; font-weight: 700; color: #888;
        }
        .game-rating-popular {
          padding: 2px 12px 10px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.82rem; font-weight: 700; color: #888;
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
        onClick={() => onClick(game)}
      >
        <div
          className={`game-cover${isPopular ? '-popular' : ''} ${!game.image ? 'no-image' : ''}`}
          style={game.image ? {
            backgroundImage: `url('${game.image}')`,
          } : {}}
        >
          <span>{game.name?.toUpperCase()}</span>
        </div>
        <div className={isPopular ? 'game-name-popular' : 'game-name'}>{game.name}</div>
        <div className={isPopular ? 'game-rating-popular' : 'game-rating'}>⭐ {game.rating}</div>
      </div>
    </>
  )
}