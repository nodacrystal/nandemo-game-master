import type { GameContext, SquareKind } from '../machines/gameMachine';
import { BOARD, BOARD_SIZE, TARGET_CRYSTALS, MAX_ROUNDS } from '../machines/gameMachine';

interface Props {
  context: GameContext;
  active: boolean;
  result: SquareKind | null;
}

const points = Array.from({ length: BOARD_SIZE }, (_, i) => ({
  x: 44 + i * 58,
  y: 92 + Math.sin(i * 0.72) * 18,
}));

function squareClass(kind: SquareKind): string {
  return `board-square board-square-${kind}`;
}

function squareLabel(kind: SquareKind): string {
  if (kind === 'star') return '★';
  if (kind === 'hole') return '!';
  return '';
}

export function GameBoard({ context, active, result }: Props) {
  const current = points[context.position] ?? points[0];
  const sparkle = result === 'star' ? current : null;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <section className="game-board" aria-label="12マスすごろく盤面">
      <div className="board-header">
        <div>
          <div className="board-title">クリスタルロード</div>
          <div className="board-meta">
            {context.crystals}/{TARGET_CRYSTALS} crystals ・ Round {context.round}/{MAX_ROUNDS}
          </div>
        </div>
        {active && (
          <div className="turn-badge">
            <span>TURN</span>
            P{context.currentPlayer}
          </div>
        )}
      </div>

      <svg className="board-svg" viewBox="0 0 720 190" role="img" aria-label="横長の12マスすごろく盤面">
        <path className="board-path-shadow" d={path} />
        <path className="board-path" d={path} />
        {points.map((point, index) => {
          const kind = BOARD[index];
          return (
            <g key={index} transform={`translate(${point.x} ${point.y})`}>
              <circle className={squareClass(kind)} r="22" />
              <text className="board-square-number" y="5" textAnchor="middle">
                {index + 1}
              </text>
              {kind !== 'normal' && (
                <text className={`board-square-icon board-square-icon-${kind}`} y="-28" textAnchor="middle">
                  {squareLabel(kind)}
                </text>
              )}
            </g>
          );
        })}

        {sparkle && (
          <g className="crystal-sparkle" transform={`translate(${sparkle.x} ${sparkle.y})`} aria-hidden="true">
            <path d="M0-48 7-14 38 0 7 14 0 48-7 14-38 0-7-14Z" />
            <circle r="8" />
          </g>
        )}

        <g
          className="player-piece"
          style={{ transform: `translate(${current.x}px, ${current.y - 42}px)` }}
          aria-label={`現在位置 ${context.position + 1}マス目`}
        >
          <ellipse cx="0" cy="38" rx="18" ry="7" fill="#000" opacity="0.25" />
          <path d="M0 0c15 0 27 12 27 27 0 21-27 43-27 43S-27 48-27 27C-27 12-15 0 0 0Z" fill="#79e5ff" />
          <circle cx="0" cy="25" r="13" fill="#dffaff" opacity="0.95" />
          <path d="M-9 17 0 3l9 14L0 47Z" fill="#1a6f8f" opacity="0.55" />
        </g>
      </svg>
    </section>
  );
}
