import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'gm' | 'user';
  text: string;
  attachment?: ChatAttachment;
}

interface Props {
  messages: ChatMessage[];
  actionArea?: ReactNode;
  inputArea: ReactNode;
}

export function ChatPanel({ messages, actionArea, inputArea }: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, actionArea]);

  return (
    <section className="chat-panel" aria-label="チャット">
      <div className="chat-history">
        {messages.map((message) => (
          <article
            className={`chat-message chat-message-${message.role}`}
            key={message.id}
          >
            <div className="chat-speaker">{message.role === 'gm' ? 'GM' : 'あなた'}</div>
            <div className="chat-bubble">
              {message.attachment && (
                <img
                  className="chat-attachment"
                  src={message.attachment.url}
                  alt={message.attachment.name}
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </article>
        ))}
        <div ref={endRef} />
      </div>
      {actionArea && <div className="chat-action-area">{actionArea}</div>}
      {inputArea}
    </section>
  );
}
