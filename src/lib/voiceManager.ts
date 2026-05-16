import { findPlayableVideo } from './videoManager';

export type VoiceKey =
  | 'greet'
  | 'ask_manual'
  | 'sugoroku_intro'
  | 'number_intro'
  | 'your_turn'
  | 'thinking';

export type VoicePlaybackKind = 'video' | 'audio' | 'speech';

export interface VoicePlayback {
  kind: VoicePlaybackKind;
  analyser: AnalyserNode | null;
  synthetic: boolean;
  videoSrc: string | null;
  ended: Promise<void>;
  stop: () => void;
}

export interface MediaAnalyserConnection {
  analyser: AnalyserNode;
  disconnect: () => void;
}

interface PlayVoiceOptions {
  skipVideo?: boolean;
}

const voiceFiles: Record<VoiceKey, string> = {
  greet: 'greet.mp3',
  ask_manual: 'ask_manual.mp3',
  sugoroku_intro: 'sugoroku_intro.mp3',
  number_intro: 'number_intro.mp3',
  your_turn: 'your_turn.mp3',
  thinking: 'thinking.mp3',
};

let audioContext: AudioContext | null = null;
const mediaSources = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

function isVoiceKey(key: string): key is VoiceKey {
  return key in voiceFiles;
}

function getAudioContext() {
  audioContext ??= new AudioContext();
  return audioContext;
}

export async function connectMediaElementToAnalyser(
  media: HTMLMediaElement
): Promise<MediaAnalyserConnection> {
  const context = getAudioContext();
  if (context.state === 'suspended') {
    await context.resume();
  }

  let source = mediaSources.get(media);
  if (!source) {
    source = context.createMediaElementSource(media);
    mediaSources.set(media, source);
  }

  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.72;
  source.connect(analyser);
  analyser.connect(context.destination);
  let connected = true;

  return {
    analyser,
    disconnect: () => {
      if (!connected) return;
      connected = false;
      try {
        source.disconnect(analyser);
      } catch {
        // Some browsers throw if a node was already disconnected during media cleanup.
      }
      analyser.disconnect();
    },
  };
}

function estimatedSpeechMs(text: string) {
  return Math.min(Math.max(text.length * 80, 1400), 7200);
}

function playSpeechSynthesis(text: string): VoicePlayback {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.92;
  utterance.pitch = 0.82;

  let timeoutId: number | null = null;
  let settled = false;
  const ended = new Promise<void>((resolve) => {
    const finish = () => {
      if (settled) return;
      settled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      resolve();
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    timeoutId = window.setTimeout(finish, estimatedSpeechMs(text));

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });

  return {
    kind: 'speech',
    analyser: null,
    synthetic: true,
    videoSrc: null,
    ended,
    stop: () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      window.speechSynthesis.cancel();
      settled = true;
    },
  };
}

function createVideoPlayback(videoSrc: string): VoicePlayback {
  let settled = false;
  let finishPlayback = () => {};
  const ended = new Promise<void>((resolve) => {
    finishPlayback = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
  });

  return {
    kind: 'video',
    analyser: null,
    synthetic: false,
    videoSrc,
    ended,
    stop: finishPlayback,
  };
}

export async function playVoice(
  key: string,
  fallbackText = key,
  options: PlayVoiceOptions = {}
): Promise<VoicePlayback> {
  if (!isVoiceKey(key)) {
    return playSpeechSynthesis(fallbackText);
  }

  if (!options.skipVideo) {
    const videoSrc = await findPlayableVideo(key);
    if (videoSrc) {
      return createVideoPlayback(videoSrc);
    }
  }

  const audio = new Audio(`${import.meta.env.BASE_URL}voices/${voiceFiles[key]}`);
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';

  try {
    const connection = await connectMediaElementToAnalyser(audio);

    let settled = false;
    let finishPlayback = () => {};
    const ended = new Promise<void>((resolve) => {
      const finish = () => {
        if (settled) return;
        settled = true;
        connection.disconnect();
        resolve();
      };
      finishPlayback = finish;
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', finish, { once: true });
    });

    await audio.play();

    return {
      kind: 'audio',
      analyser: connection.analyser,
      synthetic: false,
      videoSrc: null,
      ended,
      stop: () => {
        audio.pause();
        audio.currentTime = 0;
        finishPlayback();
      },
    };
  } catch {
    return playSpeechSynthesis(fallbackText);
  }
}
