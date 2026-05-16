interface Props {
  message: string;
}

export function MessageWindow({ message }: Props) {
  return (
    <div className="message-window" role="status" aria-live="polite">
      {message}
    </div>
  );
}
