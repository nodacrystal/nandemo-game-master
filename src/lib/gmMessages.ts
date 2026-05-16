import type { GameContext, SquareKind } from '../machines/gameMachine';
import { BOARD_SIZE, TARGET_CRYSTALS, MAX_ROUNDS } from '../machines/gameMachine';

export function messageFor(stateValue: unknown, context: GameContext): string {
  const path = stringifyState(stateValue);

  if (path === 'title') {
    return 'ようこそ。これからボードゲームを進行します。準備はよろしいでしょうか。';
  }
  if (path === 'setupPlayers') {
    return `プレイ人数を選んでください。現在の設定は${context.players}人です。`;
  }
  if (path === 'setupBoard') {
    return `紙に${BOARD_SIZE}マスの一本道を書いてください。スタートが左端、ゴールが右端です。`;
  }
  if (path === 'playing.turnStart') {
    return `第${context.round}ラウンド、プレイヤー${context.currentPlayer}の番です。サイコロを振って、出目をタップしてください。`;
  }
  if (path === 'playing.starHit') {
    return `${context.position + 1}マス目は星でした。クリスタルが1つ手に入ります。現在${context.crystals}個です。`;
  }
  if (path === 'playing.holeHit') {
    return `${context.position + 2}マス目は穴でした。コマを1マス戻します。`;
  }
  if (path === 'playing.normalHit') {
    return `${context.position + 1}マス目は通常マスでした。何も起こりません。`;
  }
  if (path === 'win') {
    return `クリスタルを${TARGET_CRYSTALS}個集めました。協力成功です。`;
  }
  if (path === 'lose') {
    return `${MAX_ROUNDS}ラウンドを終えましたが、クリスタルが足りませんでした。もう一度挑戦しましょう。`;
  }
  return '';
}

function stringifyState(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '';
    const [k, v] = entries[0];
    const child = stringifyState(v);
    return child ? `${k}.${child}` : k;
  }
  return '';
}

export function squareLabel(kind: SquareKind | null): string {
  if (kind === 'star') return '星マス';
  if (kind === 'hole') return '穴マス';
  if (kind === 'normal') return '通常マス';
  return '';
}
