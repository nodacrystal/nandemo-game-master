import { GmFace } from './GmFace';
import { connectMediaElementToAnalyser } from '../lib/voiceManager';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface Props {
  playbackState: 'idle' | 'playingVideo' | 'speaking';
  videoSrc: string | null;
  analyser: AnalyserNode | null;
  syntheticSpeech: boolean;
  expression?: 'neutral' | 'win' | 'lose';
  onVideoAnalyser: (analyser: AnalyserNode | null) => void;
  onVideoEnded: () => void;
  onVideoError: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function useAudioGlow(analyser: AnalyserNode | null, active: boolean) {
  const [glow, setGlow] = useState(0);

  useEffect(() => {
    if (!active || !analyser) {
      return undefined;
    }

    let animationId = 0;
    const samples = new Uint8Array(analyser.fftSize);

    const animate = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (let index = 0; index < samples.length; index += 1) {
        const centered = (samples[index] - 128) / 128;
        sum += centered * centered;
      }
      setGlow(clamp(Math.sqrt(sum / samples.length) * 12, 0, 1));
      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationId);
  }, [active, analyser]);

  return active && analyser ? glow : 0;
}

function GmVideo({
  src,
  audioGlow,
  onAnalyser,
  onEnded,
  onError,
}: {
  src: string;
  audioGlow: number;
  onAnalyser: (analyser: AnalyserNode | null) => void;
  onEnded: () => void;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const style = { '--gm-audio-glow': audioGlow.toFixed(3) } as CSSProperties;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let cancelled = false;
    let disconnect = () => {};

    const handleEnded = () => onEnded();
    const handleError = () => onError();

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.currentTime = 0;

    void connectMediaElementToAnalyser(video)
      .then((connection) => {
        if (cancelled) {
          connection.disconnect();
          return;
        }
        disconnect = connection.disconnect;
        onAnalyser(connection.analyser);
        return video.play();
      })
      .catch(() => {
        if (!cancelled) onError();
      });

    return () => {
      cancelled = true;
      video.pause();
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      disconnect();
      onAnalyser(null);
    };
  }, [onAnalyser, onEnded, onError, src]);

  return (
    <figure className="gm-face gm-video-figure is-speaking" style={style}>
      <div className="gm-photo-frame gm-video-frame" aria-hidden="true">
        <video
          ref={videoRef}
          className="gm-video"
          src={src}
          preload="auto"
          playsInline
          autoPlay
          controls={false}
          muted={false}
          crossOrigin="anonymous"
        />
      </div>
      <figcaption className="sr-only">なんでもゲームマスター</figcaption>
    </figure>
  );
}

export function GmStage({
  playbackState,
  videoSrc,
  analyser,
  syntheticSpeech,
  expression = 'neutral',
  onVideoAnalyser,
  onVideoEnded,
  onVideoError,
}: Props) {
  const isPlayingVideo = playbackState === 'playingVideo' && videoSrc;
  const isSpeaking = playbackState !== 'idle';
  const audioGlow = useAudioGlow(analyser, isSpeaking);

  return (
    <section className="gm-stage" aria-label="ゲームマスター">
      <div className="particle-field" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      {isPlayingVideo ? (
        <GmVideo
          src={videoSrc}
          audioGlow={audioGlow}
          onAnalyser={onVideoAnalyser}
          onEnded={onVideoEnded}
          onError={onVideoError}
        />
      ) : (
        <GmFace
          speaking={isSpeaking}
          analyser={analyser}
          syntheticSpeech={syntheticSpeech}
          expression={expression}
        />
      )}
      <div className={`result-aura result-aura-${expression}`} aria-hidden="true" />
    </section>
  );
}
