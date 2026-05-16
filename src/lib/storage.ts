const KEY = 'nandemo-gm-progress-v1';

export interface SavedSnapshot {
  stateName: string;
  context: unknown;
  savedAt: number;
}

export function saveProgress(snapshot: SavedSnapshot): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // 容量超過等は無視
  }
}

export function loadProgress(): SavedSnapshot | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSnapshot;
  } catch {
    return null;
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
