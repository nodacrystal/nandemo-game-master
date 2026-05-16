import { useRef, useState } from 'react';
import type { ChatAttachment } from './ChatPanel';

interface Props {
  onSend: (text: string, attachment?: ChatAttachment) => void;
}

export function ChatInput({ onSend }: Props) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<ChatAttachment | undefined>();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;

    onSend(trimmed, attachment);
    setText('');
    setAttachment(undefined);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="chat-input-wrap">
      {attachment && (
        <div className="pending-attachment">
          <img src={attachment.url} alt={attachment.name} />
          <span>{attachment.name}</span>
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(attachment.url);
              setAttachment(undefined);
              if (fileRef.current) fileRef.current.value = '';
            }}
            aria-label="添付画像を削除"
          >
            ×
          </button>
        </div>
      )}
      <div className="chat-input-row">
        <textarea
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="メッセージを入力"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) return;
            if (attachment?.url) URL.revokeObjectURL(attachment.url);
            setAttachment({
              id: `${Date.now()}-${file.name}`,
              name: file.name,
              url: URL.createObjectURL(file),
            });
          }}
          hidden
        />
        <button
          className="icon-button"
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="画像を添付"
          title="画像を添付"
        >
          📎
        </button>
        <button className="send-button" type="button" onClick={send}>
          送信
        </button>
      </div>
    </div>
  );
}
