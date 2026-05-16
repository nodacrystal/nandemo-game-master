import { pickByContext, stringifyState } from '../types';
import type { NumberHuntContext } from './machine';
import { MAX_NUMBER, MAX_TURNS, MIN_NUMBER } from './machine';

const playerName = (context: NumberHuntContext) => `プレイヤー${context.currentPlayer}`;

export function numberHuntMessageFor(stateValue: unknown, rawContext: unknown): string {
  const context = rawContext as NumberHuntContext;
  const path = stringifyState(stateValue);

  if (path === 'setupPlayers') {
    return pickByContext([
      `参加人数を決めてください。現在は${context.players}人です。順番に数字を宣言し、私は上下の情報だけを返します。`,
      `まず人数を確認します。${context.players}人で進める場合、手番ごとにひとつだけ数字を選びます。前の答えを必ず次へつなげましょう。`,
      `プレイヤー数を選択してください。このゲームでは、直感よりも情報の積み上げが重要です。落ち着いて範囲を狭めます。`,
      `現在の設定は${context.players}人です。人数が決まれば、誰が何ターン目に判断するかが見えます。準備ができたら始めましょう。`,
    ], context, path);
  }
  if (path === 'intro') {
    return pickByContext([
      `秘密の数字を決めました。範囲は${MIN_NUMBER}から${MAX_NUMBER}、機会は${MAX_TURNS}ターンです。私は「もっと大きい」か「もっと小さい」だけを返します。`,
      `準備は整いました。数字はひとつだけ、範囲は${MIN_NUMBER}〜${MAX_NUMBER}です。${MAX_TURNS}回の宣言で、候補をどこまで絞れるかを見ます。`,
      `これから数字読み当てを開始します。直感だけに頼らず、前の答えから範囲を削ってください。最初の宣言に入りましょう。`,
      `答えは決まっています。使える情報は上下の返答だけです。最初の一手ほど、その後の候補幅に影響することを意識してください。`,
    ], context, path);
  }
  if (path === 'guessing') {
    return pickByContext([
      `${context.turn}ターン目、${playerName(context)}の番です。現在考えられる範囲は${context.low}〜${context.high}です。宣言する数字を選んでください。`,
      `${playerName(context)}、数字をひとつ宣言してください。残りの情報は範囲だけです。いまは${context.low}から${context.high}までに絞られています。`,
      `手番は${playerName(context)}です。${context.turn}/${MAX_TURNS}ターン目。次の一言で候補の幅が変わります。中央付近も選択肢に入れましょう。`,
      `${playerName(context)}の判断です。候補は${context.low}〜${context.high}に残っています。外れた場合にも情報が増える数字を選んでください。`,
    ], context, path);
  }
  if (path === 'hint' && context.lastResult === 'higher') {
    return pickByContext([
      `${context.lastGuess}では小さすぎます。答えはもっと大きい数字です。候補は${context.low}〜${context.high}に縮まりました。次は下限を基準にします。`,
      `もっと大きいです。この返答で下限が上がりました。次のプレイヤーは、残った範囲の中央を意識して宣言しましょう。`,
      `${context.lastGuess}より上です。外れましたが、情報としては十分に意味があります。焦点を上へ移して、次の宣言に進みます。`,
      `答えは${context.lastGuess}より大きいです。いま残っているのは${context.low}〜${context.high}です。範囲の下側はもう捨てて構いません。`,
    ], context, path);
  }
  if (path === 'hint' && context.lastResult === 'lower') {
    return pickByContext([
      `${context.lastGuess}では大きすぎます。答えはもっと小さい数字です。候補は${context.low}〜${context.high}に縮まりました。次は上限を基準にします。`,
      `もっと小さいです。上限が下がりました。次は狭まった範囲の中で、外れた場合の情報量まで考えて選びましょう。`,
      `${context.lastGuess}より下です。読みは外れましたが、情報としては前進です。候補の上側を切り落として、次の手番へ渡します。`,
      `答えは${context.lastGuess}より小さいです。現在の候補は${context.low}〜${context.high}です。残った範囲を丁寧に分けていきましょう。`,
    ], context, path);
  }
  if (path === 'win') {
    return pickByContext([
      `正解です。秘密の数字は${context.secret}でした。${playerName(context)}が${context.turn}ターン目で読み切りました。範囲の削り方が適切でした。`,
      `当たりです。${context.secret}を宣言できました。前の返答を整理し、候補を狭める判断が最後の一点に届きました。`,
      `勝利です。答えは${context.secret}です。限られた手数の中で、必要な情報を使い切りました。ここでゲームを終了します。`,
      `読み切りました。秘密の数字は${context.secret}です。外れた宣言も無駄にせず、次の判断へ変換できていました。`,
    ], context, path);
  }
  if (path === 'lose') {
    return pickByContext([
      `${MAX_TURNS}ターンが終わりました。秘密の数字は${context.secret}です。今回はGMの勝ちです。候補の狭め方を次に調整しましょう。`,
      `時間切れです。答えは${context.secret}でした。最後まで近づいていましたが、確定には届きませんでした。序盤の分け方が重要です。`,
      `ここで終了です。数字は${context.secret}でした。次の勝負では、序盤から範囲を半分ずつ削る意識が効いてきます。`,
      `残念ながら未到達です。秘密の数字は${context.secret}です。各ターンで得た上下の情報を、より早く候補整理へ反映しましょう。`,
    ], context, path);
  }
  return '';
}
