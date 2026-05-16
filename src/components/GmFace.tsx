interface Props {
  speaking: boolean;
  expression?: 'neutral' | 'win' | 'lose';
}

export function GmFace({ speaking, expression = 'neutral' }: Props) {
  const isWin = expression === 'win';
  const isLose = expression === 'lose';

  return (
    <figure className={`gm-face ${speaking ? 'is-speaking' : ''}`}>
      <div className="gm-photo-frame">
        <img
          className="gm-photo"
          src="/noda-crystal.jpg"
          alt="黒いジャケット姿で腕組みをする野田クリスタルGM"
        />
        <svg className="gm-face-overlay" viewBox="0 0 650 975" aria-hidden="true">
          <defs>
            <radialGradient id="portraitVignette" cx="50%" cy="34%" r="68%">
              <stop offset="48%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.72)" />
            </radialGradient>
            <filter id="mouthBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
          </defs>

          <rect width="650" height="975" fill="url(#portraitVignette)" />
          <ellipse className="gm-eye-mask gm-eye-mask-left" cx="258" cy="248" rx="45" ry="7" />
          <ellipse className="gm-eye-mask gm-eye-mask-right" cx="392" cy="248" rx="45" ry="7" />
          <g className="gm-mouth-mask" filter="url(#mouthBlur)">
            <ellipse cx="326" cy="352" rx="48" ry="8" />
            <path d="M280 350 C306 365 346 365 373 350" />
          </g>
        </svg>
        {isWin && <div className="gm-result-mark gm-result-win" aria-hidden="true">✨</div>}
        {isLose && <div className="gm-result-mark gm-result-lose" aria-hidden="true">💧</div>}
      </div>
      <figcaption className="name">GM / 進行司会</figcaption>
    </figure>
  );
}
