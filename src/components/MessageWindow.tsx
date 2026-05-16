interface Props {
  message: string;
  speaking: boolean;
}

export function MessageWindow({ message, speaking }: Props) {
  return (
    <div className="message-window" role="status" aria-live="polite">
      <p>{message}</p>
      {speaking && (
        <span className="speech-indicator" aria-label="発話中">
          <span />
          <span />
          <span />
        </span>
      )}
    </div>
  );
}
