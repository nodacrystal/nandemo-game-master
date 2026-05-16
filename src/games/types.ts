import type { AnyStateMachine } from 'xstate';

export interface GameMeta {
  id: string;
  name: string;
  players: string;
  duration: string;
  summary: string;
}

export interface GameDefinition {
  meta: GameMeta;
  machine: AnyStateMachine;
  messageFor: (stateValue: unknown, context: unknown) => string;
}

export function stringifyState(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '';
    const [key, childValue] = entries[0];
    const child = stringifyState(childValue);
    return child ? `${key}.${child}` : key;
  }
  return '';
}

export function pickByContext<T>(items: T[], context: unknown, salt = ''): T {
  const source = JSON.stringify(context) + salt;
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  return items[hash % items.length];
}
