import { pickByContext, stringifyState } from '../types';
import type { NumberHuntContext } from './machine';
import { MAX_NUMBER, MAX_TURNS, MIN_NUMBER } from './machine';

const playerName = (context: NumberHuntContext) => `プレイヤー${context.currentPlayer}`;

export function numberHuntMessageFor(stateValue: unknown, rawContext: unknown): string {
  const context = rawContext as NumberHuntContext;
  const path = stringifyState(stateValue);

  if (path === 'setupPlayers') {
    return pickByContext([
      `参加人数を決めてください。現在は${context.players}人です。順番に数字を宣言し、私が上下だけを答えます。`,
      `まず人数を確認します。${context.players}人で進める場合、手番ごとにひとつだけ数字を選びます。`,
      `プレイヤー数を選択してください。このゲームでは、情報を積み上げる落ち着いた判断が重要になります。`,
    ], context, path);
  }
  if (path === 'intro') {
    return pickByContext([
      `秘密の数字を決めました。範囲は${MIN_NUMBER}から${MAX_NUMBER}、機会は${MAX_TURNS}ターンです。私は「もっと大きい」か「もっと小さい」だけを返します。`,
      `準備は整いました。数字はひとつだけ、範囲は${MIN_NUMBER}〜${MAX_NUMBER}です。5回の宣言で、候補をどこまで絞れるかを見ます。`,
      `これから数字読み当てを開始します。直感だけでなく、前の答えから範囲を削ってください。最初の宣言に入りましょう。`,
    ], context, path);
  }
  if (path === 'guessing') {
    return pickByContext([
      `${context.turn}ターン目、${playerName(context)}の番です。現在考えられる範囲は${context.low}〜${context.high}。宣言する数字を選んでください。`,
      `${playerName(context)}、数字をひとつ宣言してください。残りの情報は範囲だけです。いまは${context.low}から${context.high}までに絞られています。`,
      `手番は${playerName(context)}です。${context.turn}/${MAX_TURNS}ターン目。次の一言で、候補の幅をさらに狭めましょう。`,
    ], context, path);
  }
  if (path === 'hint' && context.lastResult === 'higher') {
    return pickByContext([
      `${context.lastGuess}では小さすぎます。答えはもっと大きい数字です。候補は${context.low}〜${context.high}に縮まりました。`,
      `もっと大きいです。この返答で下限が上がりました。次のプレイヤーは、残った範囲の中央も意識してください。`,
      `${context.lastGuess}より上です。情報は十分に意味があります。焦点を少し上へ移して、次の宣言に進みます。`,
    ], context, path);
  }
  if (path === 'hint' && context.lastResult === 'lower') {
    return pickByContext([
      `${context.lastGuess}では大きすぎます。答えはもっと小さい数字です。候補は${context.low}〜${context.high}に縮まりました。`,
      `もっと小さいです。上限が下がりました。次は狭まった範囲の中で、外し方まで考えて選びましょう。`,
      `${context.lastGuess}より下です。読みは外れましたが、情報としては前進です。次の手番へ渡します。`,
    ], context, path);
  }
  if (path === 'win') {
    return pickByContext([
      `正解です。秘密の数字は${context.secret}でした。${playerName(context)}が${context.turn}ターン目で読み切りました。`,
      `当たりです。${context.secret}を宣言できました。範囲を削る判断が、最後の一点に届きました。`,
      `勝利です。答えは${context.secret}。限られた手数の中で、必要な情報を使い切りました。`,
    ], context, path);
  }
  if (path === 'lose') {
    return pickByContext([
      `${MAX_TURNS}ターンが終わりました。秘密の数字は${context.secret}です。今回はGMの勝ちです。候補の狭め方を次に調整しましょう。`,
      `時間切れです。答えは${context.secret}でした。最後まで近づいていましたが、確定には届きませんでした。`,
      `ここで終了です。数字は${context.secret}。次の勝負では、序盤から範囲を半分ずつ削る意識が効いてきます。`,
    ], context, path);
  }
  return '';
}
