import { stringifyState } from '../games/types';
import type { NumberHuntContext } from '../games/numberHunt/machine';
import { MAX_NUMBER, MIN_NUMBER } from '../games/numberHunt/machine';

interface Props {
  gameId: string;
  stateValue: unknown;
  context: unknown;
  onStart: () => void;
  onSetPlayers: (n: number) => void;
  onNext: () => void;
  onRoll: (v: number) => void;
  onGuess: (v: number) => void;
  onReset: () => void;
}

export function ActionPanel({
  gameId,
  stateValue,
  context,
  onStart,
  onSetPlayers,
  onNext,
  onRoll,
  onGuess,
  onReset,
}: Props) {
  const path = stringifyState(stateValue);

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
    const players = (context as { players: number }).players;
    return (
      <div className="action-panel">
        <div className="player-select">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              className={`pill ${players === n ? 'active' : ''}`}
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

  if (gameId === 'sugoroku' && path === 'setupBoard') {
    return (
      <div className="action-panel">
        <button className="primary" onClick={onNext}>
          描けた、次へ
        </button>
      </div>
    );
  }

  if (gameId === 'numberHunt' && path === 'intro') {
    return (
      <div className="action-panel">
        <button className="primary" onClick={onNext}>
          最初の宣言へ
        </button>
      </div>
    );
  }

  if (gameId === 'sugoroku' && path === 'playing.turnStart') {
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

  if (gameId === 'numberHunt' && path === 'guessing') {
    const numberContext = context as NumberHuntContext;
    const candidates = Array.from(
      { length: numberContext.high - numberContext.low + 1 },
      (_, i) => numberContext.low + i
    );
    return (
      <div className="action-panel">
        <div className="number-grid">
          {candidates.map((v) => (
            <button key={v} className="number-choice" onClick={() => onGuess(v)}>
              {v}
            </button>
          ))}
        </div>
        <div className="number-range-note">
          選択範囲: {Math.max(MIN_NUMBER, numberContext.low)}〜{Math.min(MAX_NUMBER, numberContext.high)}
        </div>
      </div>
    );
  }

  if (gameId === 'sugoroku' && (
    path === 'playing.starHit' ||
    path === 'playing.holeHit' ||
    path === 'playing.normalHit'
  )) {
    return (
      <div className="action-panel">
        <button className="primary" onClick={onNext}>
          次のプレイヤーへ
        </button>
      </div>
    );
  }

  if (gameId === 'numberHunt' && path === 'hint') {
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
