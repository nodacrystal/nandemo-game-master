import type { GameMeta } from '../games/types';

interface Props {
  games: GameMeta[];
  onSelect: (gameId: string) => void;
}

export function GameSelect({ games, onSelect }: Props) {
  return (
    <section className="game-select" aria-label="ゲーム選択">
      <div className="select-heading">
        <h2>遊ぶゲームを選んでください</h2>
      </div>
      <div className="game-card-list">
        {games.map((game) => (
          <article className="game-card" key={game.id}>
            <div className="game-card-thumb" aria-hidden="true" />
            <div>
              <h3>{game.name}</h3>
              <div className="game-card-meta">
                <span>{game.players}</span>
                <span>{game.duration}</span>
              </div>
              <p>{game.summary}</p>
            </div>
            <button className="primary" type="button" onClick={() => onSelect(game.id)}>
              遊ぶ
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
