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
      `最初に参加人数を整えます。現在の設定は${context.players}人です。人数が定まると、手番の巡り方と残りラウンドの見通しが明確になります。`,
      `プレイヤー数を確認しましょう。いまは${context.players}人で進行する設定です。全員が同じ盤面を見て、順番に判断を積み重ねます。`,
      `このゲームは手番の配分が重要です。${context.players}人で進める場合、誰の一手で星へ届くかを全員で意識しておきましょう。`,
      `参加人数を選択してください。現在は${context.players}人です。ここを決めれば、勝利条件までの道筋を落ち着いて組み立てられます。`,
    ], context, path);
  }
  if (path === 'setupBoard') {
    return pickByContext([
      `紙に${BOARD_SIZE}マスの一本道を描いてください。左端をスタート、右端を終点にします。星と穴の位置を確認してから始めましょう。`,
      `${BOARD_SIZE}マスの盤面を用意します。コマは1マス目、目標はクリスタル${TARGET_CRYSTALS}個です。盤面が見えるだけで判断は安定します。`,
      `盤面の準備です。${BOARD_SIZE}マスを横に並べ、星と穴を画面の配置に合わせてください。ここから${MAX_ROUNDS}ラウンド以内に成果を作ります。`,
      `開始前に盤面を確認します。星は得点、穴は後退です。どの出目で局面が変わるかを見てから、最初の手番へ進みましょう。`,
    ], context, path);
  }
  if (path === 'playing.turnStart') {
    return pickByContext([
      `第${context.round}ラウンド、${playerName(context)}の手番です。現在地は${squareNumber(context)}マス目。星までの距離と穴の位置を確認してから出目を入力しましょう。`,
      `${playerName(context)}、進める番です。現在はクリスタル${context.crystals}/${TARGET_CRYSTALS}、ラウンド${context.round}/${MAX_ROUNDS}です。盤面の残り幅を見て判断します。`,
      `手番が${playerName(context)}に移りました。いまの位置は${squareNumber(context)}マス目です。出目ひとつで星にも穴にも届くため、結果を静かに見極めましょう。`,
      `${playerName(context)}の一手です。現在の成果はクリスタル${context.crystals}個。勝利条件までの不足を意識しながら、サイコロの結果を入力してください。`,
    ], context, path);
  }
  if (path === 'playing.starHit') {
    return pickByContext([
      `コマは${squareNumber(context)}マス目に止まりました。星です。クリスタルは${context.crystals}/${TARGET_CRYSTALS}になりました。次はこの成果を維持する位置取りを考えます。`,
      `${playerName(context)}の一手は星に届きました。得点は明確な前進です。ただし残りラウンドは${MAX_ROUNDS - context.round + 1}回分、次の移動先も確認しておきましょう。`,
      `${squareNumber(context)}マス目で星を確認しました。勝利条件に近づいています。ここで気を緩めず、穴を踏んだ場合の戻り位置まで見ておきます。`,
      `星マスです。クリスタルを1つ得ました。現在${context.crystals}個です。次のプレイヤーは、同じ勢いを続けるための出目を意識しましょう。`,
    ], context, path);
  }
  if (path === 'playing.holeHit') {
    return pickByContext([
      `穴に入りました。コマは1マス戻り、現在は${squareNumber(context)}マス目です。損失は限定的です。次の手で星までの距離を取り直しましょう。`,
      `${playerName(context)}のコマは穴の効果で後退しました。盤面全体を見ると、まだ挽回できます。焦らず、次の出目で回復する道を選びます。`,
      `ここは穴です。1マス戻したことで、星への距離も変わりました。次のプレイヤーは新しい現在地を基準にして判断してください。`,
      `後退が発生しました。現在地は${squareNumber(context)}マス目です。流れを失ったわけではありません。残りラウンドを見て、次の一手へ整えます。`,
    ], context, path);
  }
  if (path === 'playing.normalHit') {
    return pickByContext([
      `コマは${squareNumber(context)}マス目に止まりました。通常マスです。成果も損失もありません。次の手番に向けて、星までの距離を確認します。`,
      `${squareNumber(context)}マス目は静かなマスです。状況は維持されています。この停止を、次の判断を落ち着いて整える時間として使いましょう。`,
      `通常マスに止まりました。クリスタルは${context.crystals}/${TARGET_CRYSTALS}のままです。残りラウンドと必要数を見比べ、次の一手に備えます。`,
      `今回は盤面効果なしです。現在地は${squareNumber(context)}マス目。悪い結果ではありません。次に星へ届く出目を全員で共有しましょう。`,
    ], context, path);
  }
  if (path === 'win') {
    return pickByContext([
      `クリスタルが${TARGET_CRYSTALS}個そろいました。協力成功です。手番ごとに盤面を確認し、必要な成果へ届いたことを評価します。`,
      `条件達成です。${MAX_ROUNDS}ラウンド以内にクリスタルを集め切りました。盤面の読みと手番の連携が、最後の結果につながりました。`,
      `勝利です。偶然の出目だけでなく、次の位置を見続けたことが効いています。ここでゲームを終了します。お疲れさまでした。`,
      `目標達成です。クリスタル${TARGET_CRYSTALS}個に到達しました。星を拾う判断と穴への備えが、全体として安定していました。`,
    ], context, path);
  }
  if (path === 'lose') {
    return pickByContext([
      `${MAX_ROUNDS}ラウンドが終了しました。クリスタルは目標に届いていません。進行はここまでです。次は星までの距離を早めに意識しましょう。`,
      `時間切れです。盤面には届かなかった可能性が残っています。次の挑戦では、穴を越えた後の立て直しをより早く行いましょう。`,
      `今回はGM側の勝ちです。流れは悪くありませんでしたが、必要なクリスタル数には足りませんでした。序盤の星への寄せ方を見直せます。`,
      `終了です。現在のクリスタルは${context.crystals}/${TARGET_CRYSTALS}でした。結果を受け止め、次は得点機会を逃さない進行を選びましょう。`,
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
