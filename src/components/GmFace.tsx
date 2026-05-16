interface Props {
  speaking: boolean;
  expression?: 'neutral' | 'win' | 'lose';
}

export function GmFace({ speaking, expression = 'neutral' }: Props) {
  const isWin = expression === 'win';
  const isLose = expression === 'lose';

  return (
    <div className={`gm-face ${speaking ? 'is-speaking' : ''}`}>
      <svg
        className="gm-portrait"
        viewBox="0 0 280 300"
        role="img"
        aria-label="落ち着いて知的な男性司会者のGM"
      >
        <defs>
          <linearGradient id="suitGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#27303d" />
            <stop offset="100%" stopColor="#111722" />
          </linearGradient>
          <radialGradient id="skinGradient" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#f4c7a2" />
            <stop offset="100%" stopColor="#c98b67" />
          </radialGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>

        <g className="gm-breath" filter="url(#softShadow)">
          <path d="M70 288c7-47 35-75 70-75s63 28 70 75H70Z" fill="url(#suitGradient)" />
          <path d="M118 218h44l-9 35h-26l-9-35Z" fill="#e8d2c2" />
          <path d="M108 228l32 51 32-51 17 60H91l17-60Z" fill="#f3f0ea" />
          <path d="M122 242l18-12 18 12-18 16-18-16Z" fill="#1b1f2a" />
          <path d="M104 226l25 63H74c5-31 15-51 30-63Z" fill="#202938" />
          <path d="M176 226c15 12 25 32 30 63h-55l25-63Z" fill="#202938" />

          <g className="gm-head">
            <path
              d="M82 114c0-45 22-76 58-76s58 31 58 76c0 58-26 91-58 91s-58-33-58-91Z"
              fill="url(#skinGradient)"
            />
            <path
              d="M81 102c4-43 27-70 61-70 30 0 50 18 57 51-21-15-47-21-82-15-14 2-25 12-36 34Z"
              fill="#1d1c1b"
            />
            <path
              d="M93 76c20-33 62-45 92-15-22-6-39-6-58 1-15 6-26 7-34 14Z"
              fill="#2a2926"
            />
            <path d="M86 112c-13 4-16 33 0 42" fill="none" stroke="#bd7c5d" strokeWidth="8" strokeLinecap="round" />
            <path d="M194 112c13 4 16 33 0 42" fill="none" stroke="#bd7c5d" strokeWidth="8" strokeLinecap="round" />
            <path d="M113 105c10-7 22-7 31-1" fill="none" stroke="#2d2420" strokeWidth="5" strokeLinecap="round" />
            <path d="M167 104c-9-6-21-6-30 1" fill="none" stroke="#2d2420" strokeWidth="5" strokeLinecap="round" />

            <g className="gm-eye gm-eye-left">
              <path
                d={isLose ? 'M108 126c10 6 20 6 30 0' : 'M108 124c9-5 21-5 30 0'}
                fill="none"
                stroke="#181818"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {!isLose && <circle cx="124" cy="123" r="4" fill="#111" />}
            </g>
            <g className="gm-eye gm-eye-right">
              <path
                d={isLose ? 'M150 126c10 6 20 6 30 0' : 'M150 124c9-5 21-5 30 0'}
                fill="none"
                stroke="#181818"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {!isLose && <circle cx="164" cy="123" r="4" fill="#111" />}
            </g>

            <path d="M141 126c-3 13-8 25-2 30 4 3 10 1 13-1" fill="none" stroke="#a86f55" strokeWidth="4" strokeLinecap="round" />
            <path
              className="gm-mouth"
              d={isWin ? 'M121 168c13 14 34 14 47 0' : 'M124 170c11 3 23 3 34 0'}
              fill="none"
              stroke="#673324"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <ellipse cx="111" cy="151" rx="8" ry="4" fill="#d99378" opacity="0.28" />
            <ellipse cx="171" cy="151" rx="8" ry="4" fill="#d99378" opacity="0.28" />
          </g>
        </g>
      </svg>
      <div className="name">GM / 進行司会</div>
    </div>
  );
}
