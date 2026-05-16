import type { NumberHuntContext } from '../games/numberHunt/machine';
import { MAX_TURNS } from '../games/numberHunt/machine';

interface Props {
  context: NumberHuntContext;
  active: boolean;
}

export function NumberHuntBoard({ context, active }: Props) {
  const hint =
    context.lastResult === 'higher'
      ? 'もっと大きい'
      : context.lastResult === 'lower'
        ? 'もっと小さい'
        : context.lastResult === 'hit'
          ? '正解'
          : '未判定';

  return (
    <section className="number-board" aria-label="数字読み当ての状況">
      <div className="board-header">
        <div>
          <div className="board-title">数字読み当て</div>
          <div className="board-meta">
            Range {context.low}-{context.high} ・ Turn {context.turn}/{MAX_TURNS}
          </div>
        </div>
        {active && (
          <div className="turn-badge">
            <span>TURN</span>
            P{context.currentPlayer}
          </div>
        )}
      </div>
      <div className="number-board-main">
        <div className="secret-card">
          <span>SECRET</span>
          <strong>?</strong>
        </div>
        <div className="number-readout">
          <div>
            <span>直前の宣言</span>
            <strong>{context.lastGuess ?? '-'}</strong>
          </div>
          <div>
            <span>GM判定</span>
            <strong>{hint}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
