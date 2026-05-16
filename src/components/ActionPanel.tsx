import type { GameContext } from '../machines/gameMachine';

interface Props {
  stateValue: unknown;
  context: GameContext;
  onStart: () => void;
  onSetPlayers: (n: number) => void;
  onNext: () => void;
  onRoll: (v: number) => void;
  onReset: () => void;
}

function pathOf(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '';
    const [k, v] = entries[0];
    const child = pathOf(v);
    return child ? `${k}.${child}` : k;
  }
  return '';
}

export function ActionPanel({
  stateValue,
  context,
  onStart,
  onSetPlayers,
  onNext,
  onRoll,
  onReset,
}: Props) {
  const path = pathOf(stateValue);

  if (path === 'title') {
    return (
      <div className="action-panel">
        <button className="primary" onClick={onStart}>
          始める
        </button>
      </div>
    );
  }

  if (path === 'setupPlayers') {
    return (
      <div className="action-panel">
        <div className="player-select">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              className={`pill ${context.players === n ? 'active' : ''}`}
              onClick={() => onSetPlayers(n)}
            >
              {n}人
            </button>
          ))}
        </div>
        <button className="primary" onClick={onNext}>
          次へ
        </button>
      </div>
    );
  }

  if (path === 'setupBoard') {
    return (
      <div className="action-panel">
        <button className="primary" onClick={onNext}>
          描けた、次へ
        </button>
      </div>
    );
  }

  if (path === 'playing.turnStart') {
    return (
      <div className="action-panel">
        <div className="dice-row">
          {[1, 2, 3, 4, 5, 6].map((v) => (
            <button key={v} className="dice" onClick={() => onRoll(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (
    path === 'playing.starHit' ||
    path === 'playing.holeHit' ||
    path === 'playing.normalHit'
  ) {
    return (
      <div className="action-panel">
        <button className="primary" onClick={onNext}>
          次のプレイヤーへ
        </button>
      </div>
    );
  }

  if (path === 'win' || path === 'lose') {
    return (
      <div className="action-panel">
        <button className="primary" onClick={onReset}>
          もう一度
        </button>
      </div>
    );
  }

  return null;
}
