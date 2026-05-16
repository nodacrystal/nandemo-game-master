interface Props {
  speaking: boolean;
  expression?: 'neutral' | 'win' | 'lose';
}

export function GmFace({ speaking, expression = 'neutral' }: Props) {
  const isWin = expression === 'win';
  const isLose = expression === 'lose';

  return (
    <figure className={`gm-face ${speaking ? 'is-speaking' : ''} expression-${expression}`}>
      <div className="gm-photo-frame" aria-hidden="true">
        <img
          className="gm-photo"
          src="/gm-noda.png"
          alt=""
        />
        {isWin && <div className="gm-result-mark gm-result-win" aria-hidden="true">✨</div>}
        {isLose && <div className="gm-result-mark gm-result-lose" aria-hidden="true">💧</div>}
      </div>
      <figcaption className="sr-only">なんでもゲームマスター</figcaption>
    </figure>
  );
}
