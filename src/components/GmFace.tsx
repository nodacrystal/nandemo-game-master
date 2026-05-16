import { useEffect, useRef, useState } from 'react';

interface Props {
  speaking: boolean;
  analyser: AnalyserNode | null;
  syntheticSpeech: boolean;
  expression?: 'neutral' | 'win' | 'lose';
}

const imagePath = `${import.meta.env.BASE_URL}gm-noda.png`;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function GmFace({
  speaking,
  analyser,
  syntheticSpeech,
  expression = 'neutral',
}: Props) {
  const [mouthScale, setMouthScale] = useState(1);
  const [blink, setBlink] = useState(false);
  const syntheticLevelRef = useRef(1);
  const visibleMouthScale = speaking ? mouthScale : 1;
  const isWin = expression === 'win';
  const isLose = expression === 'lose';

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 110);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!speaking) {
      return;
    }

    let animationId = 0;
    let syntheticTimerId: number | null = null;
    const samples = analyser ? new Uint8Array(analyser.fftSize) : null;

    if (!analyser && syntheticSpeech) {
      syntheticTimerId = window.setInterval(() => {
        syntheticLevelRef.current = 0.4 + Math.random() * 1.2;
      }, 500);
    }

    const animate = () => {
      if (analyser && samples) {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (let index = 0; index < samples.length; index += 1) {
          const centered = (samples[index] - 128) / 128;
          sum += centered * centered;
        }
        const rms = Math.sqrt(sum / samples.length);
        setMouthScale(clamp(0.4 + rms * 9.5, 0.4, 1.6));
      } else if (syntheticSpeech) {
        setMouthScale(syntheticLevelRef.current);
      } else {
        setMouthScale(1);
      }

      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationId);
      if (syntheticTimerId) window.clearInterval(syntheticTimerId);
    };
  }, [analyser, speaking, syntheticSpeech]);

  return (
    <figure className={`gm-face ${speaking ? 'is-speaking' : ''} expression-${expression}`}>
      <div className="gm-photo-frame" aria-hidden="true">
        <svg
          className="gm-avatar"
          viewBox="0 0 650 975"
          role="img"
          aria-label="なんでもゲームマスター"
        >
          <defs>
            <radialGradient id="gmMouthGlow" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#ffb0a6" stopOpacity="0.86" />
              <stop offset="56%" stopColor="#7c2028" stopOpacity="0.78" />
              <stop offset="100%" stopColor="#13080b" stopOpacity="0.92" />
            </radialGradient>
            <clipPath id="gmMouthClip">
              <ellipse cx="335" cy="450" rx="48" ry="18" />
            </clipPath>
          </defs>

          <image href={imagePath} width="650" height="975" preserveAspectRatio="xMidYMid meet" />

          <g className="gm-face-glow">
            <ellipse cx="326" cy="454" rx="70" ry="34" />
          </g>

          <g
            className="gm-mouth"
            clipPath="url(#gmMouthClip)"
            transform={`translate(335 450) scale(1 ${visibleMouthScale.toFixed(3)}) translate(-335 -450)`}
          >
            <ellipse cx="335" cy="450" rx="43" ry="13" fill="url(#gmMouthGlow)" />
            <ellipse cx="335" cy="443" rx="39" ry="5" fill="rgba(255,255,255,0.22)" />
            <ellipse cx="335" cy="459" rx="30" ry="5" fill="rgba(18,4,7,0.56)" />
          </g>

          {blink && (
            <g className="gm-blink">
              <ellipse cx="240" cy="296" rx="38" ry="16" />
              <ellipse cx="415" cy="296" rx="38" ry="16" />
            </g>
          )}
        </svg>
        {isWin && <div className="gm-result-mark gm-result-win" aria-hidden="true">✨</div>}
        {isLose && <div className="gm-result-mark gm-result-lose" aria-hidden="true">💧</div>}
      </div>
      <figcaption className="sr-only">なんでもゲームマスター</figcaption>
    </figure>
  );
}
