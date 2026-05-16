export type VoiceKey =
  | 'greet'
  | 'ask_manual'
  | 'sugoroku_intro'
  | 'number_intro'
  | 'your_turn'
  | 'thinking';

export interface VoicePlayback {
  analyser: AnalyserNode | null;
  synthetic: boolean;
  ended: Promise<void>;
  stop: () => void;
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

function isVoiceKey(key: string): key is VoiceKey {
  return key in voiceFiles;
}

function getAudioContext() {
  audioContext ??= new AudioContext();
  return audioContext;
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
    analyser: null,
    synthetic: true,
    ended,
    stop: () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      window.speechSynthesis.cancel();
      settled = true;
    },
  };
}

export async function playVoice(key: string, fallbackText = key): Promise<VoicePlayback> {
  if (!isVoiceKey(key)) {
    return playSpeechSynthesis(fallbackText);
  }

  const audio = new Audio(`${import.meta.env.BASE_URL}voices/${voiceFiles[key]}`);
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';

  try {
    const context = getAudioContext();
    if (context.state === 'suspended') {
      await context.resume();
    }

    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
    analyser.connect(context.destination);

    let settled = false;
    let finishPlayback = () => {};
    const ended = new Promise<void>((resolve) => {
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      finishPlayback = finish;
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', finish, { once: true });
    });

    await audio.play();

    return {
      analyser,
      synthetic: false,
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
