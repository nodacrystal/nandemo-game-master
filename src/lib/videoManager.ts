import type { VoiceKey } from './voiceManager';

const videoFiles: Record<VoiceKey, string> = {
  greet: 'greet.mp4',
  ask_manual: 'ask_manual.mp4',
  sugoroku_intro: 'sugoroku_intro.mp4',
  number_intro: 'number_intro.mp4',
  your_turn: 'your_turn.mp4',
  thinking: 'thinking.mp4',
};

const videoAvailabilityCache = new Map<string, boolean>();

function isVideoKey(key: string): key is VoiceKey {
  return key in videoFiles;
}

export function videoPathForKey(key: string) {
  if (!isVideoKey(key)) return null;
  return `${import.meta.env.BASE_URL}videos/${videoFiles[key]}`;
}

export async function findPlayableVideo(key: string, timeoutMs = 1000) {
  const videoPath = videoPathForKey(key);
  if (!videoPath) return null;

  const cached = videoAvailabilityCache.get(videoPath);
  if (cached === true) return videoPath;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(videoPath, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });
    const available = response.ok;
    if (available) {
      videoAvailabilityCache.set(videoPath, true);
    }
    return available ? videoPath : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
