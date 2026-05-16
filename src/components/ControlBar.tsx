interface Props {
  onBack: () => void;
  onSkip: () => void;
  onQuestion: () => void;
  onCancel: () => void;
  disabledBack?: boolean;
  disabledSkip?: boolean;
}

export function ControlBar({
  onBack,
  onSkip,
  onQuestion,
  onCancel,
  disabledBack,
  disabledSkip,
}: Props) {
  return (
    <div className="control-bar">
      <button onClick={onBack} disabled={disabledBack}>
        戻る
      </button>
      <button onClick={onSkip} disabled={disabledSkip}>
        スキップ
      </button>
      <button onClick={onQuestion}>質問</button>
      <button onClick={onCancel}>中断</button>
    </div>
  );
}
