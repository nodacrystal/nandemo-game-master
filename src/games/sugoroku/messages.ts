import { pickByContext, stringifyState } from '../types';
import type { SugorokuContext, SquareKind } from './machine';
import { BOARD_SIZE, TARGET_CRYSTALS, MAX_ROUNDS } from './machine';

const playerName = (context: SugorokuContext) => `プレイヤー${context.currentPlayer}`;
const squareNumber = (context: SugorokuContext) => context.position + 1;

export function sugorokuMessageFor(stateValue: unknown, rawContext: unknown): string {
  const context = rawContext as SugorokuContext;
  const path = stringifyState(stateValue);

  if (path === 'setupPlayers') {
    return pickByContext([
      `遊ぶ人数を決めましょう。現在は${context.players}人です。人数が定まると、手番の流れも見通しやすくなります。`,
      `まず参加人数を確認します。いまの設定は${context.players}人。全員が順に判断を重ねていく形になります。`,
      `プレイヤー数を選んでください。${context.players}人で進めるなら、このまま次へ進めます。`,
    ], context, path);
  }
  if (path === 'setupBoard') {
    return pickByContext([
      `紙に${BOARD_SIZE}マスの一本道を描いてください。左端をスタート、右端を終点にします。盤面が見えるだけで、判断はかなり落ち着きます。`,
      `${BOARD_SIZE}マスの道を用意しましょう。星と穴の位置は画面の盤面を参考にしてください。準備が整ったら、最初の一手に入ります。`,
      `盤面の準備です。${BOARD_SIZE}マスを横に並べ、コマを1マス目へ置いてください。ここから6ラウンド以内に流れを作ります。`,
    ], context, path);
  }
  if (path === 'playing.turnStart') {
    return pickByContext([
      `第${context.round}ラウンド、${playerName(context)}の手番です。現在地は${squareNumber(context)}マス目。出目を選ぶ前に、星までの距離を確認しておきましょう。`,
      `${playerName(context)}、進める番です。ラウンドは${context.round}/${MAX_ROUNDS}、クリスタルは${context.crystals}/${TARGET_CRYSTALS}。サイコロの結果を入力してください。`,
      `手番が${playerName(context)}に移りました。盤面はまだ動かせます。出目を受けて、次の展開を静かに見極めましょう。`,
    ], context, path);
  }
  if (path === 'playing.starHit') {
    return pickByContext([
      `コマは${squareNumber(context)}マス目に止まりました。星です。クリスタルを1つ得て、合計は${context.crystals}個。勝利条件が少し近づきました。`,
      `${playerName(context)}の一手は星に届きました。クリスタルは${context.crystals}/${TARGET_CRYSTALS}。次の手番では、この勢いを保てる位置取りを考えましょう。`,
      `${squareNumber(context)}マス目で星を確認しました。これは大きい進展です。ただし残りラウンドも意識して、次の移動先を見ておきます。`,
    ], context, path);
  }
  if (path === 'playing.holeHit') {
    return pickByContext([
      `穴に入りました。コマは1マス戻り、現在は${squareNumber(context)}マス目です。損失は小さく抑えられています。次の手で立て直しましょう。`,
      `${playerName(context)}のコマは穴の効果で後退しました。盤面全体を見ると、まだ挽回の余地はあります。焦らず次へつなぎます。`,
      `ここは穴です。1マス戻したことで、星への距離も変わりました。次のプレイヤーは新しい位置から判断してください。`,
    ], context, path);
  }
  if (path === 'playing.normalHit') {
    return pickByContext([
      `コマは${squareNumber(context)}マス目に止まりました。何も起きません。次の手を考える前に、盤面全体を見渡してみましょう。`,
      `${squareNumber(context)}マス目は静かなマスです。成果も損失もありません。この空白を、次の判断のための間として使います。`,
      `通常マスに止まりました。状況は維持されています。残りラウンドとクリスタル数を見比べて、次の一手に備えましょう。`,
    ], context, path);
  }
  if (path === 'win') {
    return pickByContext([
      `クリスタルが${TARGET_CRYSTALS}個そろいました。協力成功です。最後まで手番をつなぎ、必要な成果に届きました。`,
      `条件達成です。${MAX_ROUNDS}ラウンド以内にクリスタルを集め切りました。盤面の読みと手番の連携が勝因です。`,
      `勝利です。偶然だけでなく、次の位置を見続けたことが結果につながりました。ここでゲームを終了します。`,
    ], context, path);
  }
  if (path === 'lose') {
    return pickByContext([
      `${MAX_ROUNDS}ラウンドが終了しました。クリスタルは目標に届いていません。進行はここまでです。次は星までの距離を早めに意識しましょう。`,
      `時間切れです。盤面には届かなかった可能性が残っています。次の挑戦では、穴を越えた後の立て直しが鍵になります。`,
      `今回はGM側の勝ちです。流れは悪くありませんでしたが、必要なクリスタル数には足りませんでした。もう一度なら、序盤の判断を変えられます。`,
    ], context, path);
  }
  return '';
}

export function squareLabel(kind: SquareKind | null): string {
  if (kind === 'star') return '星マス';
  if (kind === 'hole') return '穴マス';
  if (kind === 'normal') return '通常マス';
  return '';
}
