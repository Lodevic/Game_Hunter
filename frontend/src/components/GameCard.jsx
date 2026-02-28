export default function GameCard({ game, onClick, size = 'normal' }) {
  const isPopular = size === 'popular'

  return (
    <div
      className={isPopular ? 'game-card-popular' : 'game-card'}
      onClick={() => onClick(game)}
    >
      <div
        className={`game-cover${isPopular ? '-popular' : ''} ${!game.image ? 'no-image' : ''}`}
        style={game.image ? { backgroundImage: `url('${game.image}')` } : {}}
      >
        <span>{game.name?.toUpperCase()}</span>
      </div>
      <div className={isPopular ? 'game-name-popular' : 'game-name'}>{game.name}</div>
      <div className={isPopular ? 'game-rating-popular' : 'game-rating'}>⭐ {game.rating}</div>
    </div>
  )
}