import { GmFace } from './GmFace';

interface Props {
  speaking: boolean;
  expression?: 'neutral' | 'win' | 'lose';
}

export function GmStage({ speaking, expression = 'neutral' }: Props) {
  return (
    <section className="gm-stage" aria-label="ゲームマスター">
      <div className="particle-field" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <GmFace speaking={speaking} expression={expression} />
      <div className={`result-aura result-aura-${expression}`} aria-hidden="true" />
    </section>
  );
}
