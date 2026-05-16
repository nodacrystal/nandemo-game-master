interface Props {
  open: boolean;
  onClose: () => void;
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'クリスタルはいくつ集めれば勝ち?',
    a: '3つ集めれば協力成功です。',
  },
  {
    q: '何ラウンドで終わる?',
    a: '最大6ラウンドです。6ラウンド以内に3つ集められないと失敗です。',
  },
  {
    q: '星マスの効果は?',
    a: '止まったプレイヤーがクリスタルを1つ獲得します。',
  },
  {
    q: '穴マスの効果は?',
    a: '1マス戻ります。スタート位置より戻ることはありません。',
  },
];

export function QuestionPanel({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">よくある質問</div>
        <ul className="faq-list">
          {FAQ.map((item) => (
            <li key={item.q}>
              <div className="q">Q. {item.q}</div>
              <div className="a">A. {item.a}</div>
            </li>
          ))}
        </ul>
        <button className="primary" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}
