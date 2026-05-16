import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import { saveProgress, clearProgress } from './lib/storage';
import { gameById } from './games/registry';
import { stringifyState, type GameDefinition } from './games/types';
import type { NumberHuntContext } from './games/numberHunt/machine';
import type { SugorokuContext, SquareKind } from './games/sugoroku/machine';
import { GmStage } from './components/GmStage';
import { ChatPanel, type ChatAttachment, type ChatMessage } from './components/ChatPanel';
import { ChatInput } from './components/ChatInput';
import { ActionPanel } from './components/ActionPanel';
import { ControlBar } from './components/ControlBar';
import { QuestionPanel } from './components/QuestionPanel';
import { GameBoard } from './components/GameBoard';
import { NumberHuntBoard } from './components/NumberHuntBoard';
import './App.css';

const INITIAL_GREETING =
  'こんばんは。なんでもゲームマスターです。説明書の写真を貼っていただくか、遊びたいゲーム名を教えてください。';

function createId() {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function gameIdFromText(text: string): string | null {
  const normalized = text.replace(/\s/g, '').toLowerCase();
  if (normalized.includes('すごろく') || normalized.includes('双六')) return 'sugoroku';
  if (
    normalized.includes('数字読み当て') ||
    normalized.includes('数字読当て') ||
    normalized.includes('numberhunt')
  ) {
    return 'numberHunt';
  }
  return null;
}

function describeAttachment(attachment: ChatAttachment) {
  const baseName = attachment.name.replace(/\.[^.]+$/, '').trim();
  return baseName ? `「${baseName}」` : 'お預かりした説明書';
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: createId(), role: 'gm', text: INITIAL_GREETING },
  ]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gmSpeaking, setGmSpeaking] = useState(true);
  const [expression, setExpression] = useState<'neutral' | 'win' | 'lose'>('neutral');
  const speechTimerRef = useRef<number | null>(null);
  const replyTimerRef = useRef<number | null>(null);

  const selectedGame = selectedGameId ? gameById.get(selectedGameId) ?? null : null;

  const speakFor = useCallback((text: string) => {
    if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current);
    setGmSpeaking(true);
    const duration = Math.min(Math.max(text.length * 34, 1200), 4200);
    speechTimerRef.current = window.setTimeout(() => {
      setGmSpeaking(false);
      speechTimerRef.current = null;
    }, duration);
  }, []);

  const sayGm = useCallback((text: string) => {
    if (!text) return;
    setMessages((current) => [...current, { id: createId(), role: 'gm', text }]);
    speakFor(text);
  }, [speakFor]);

  useEffect(() => {
    speechTimerRef.current = window.setTimeout(() => {
      setGmSpeaking(false);
      speechTimerRef.current = null;
    }, Math.min(Math.max(INITIAL_GREETING.length * 34, 1200), 4200));
    return () => {
      if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current);
      if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
    };
  }, []);

  const resetToOpening = useCallback(() => {
    clearProgress();
    setSelectedGameId(null);
    setExpression('neutral');
    setMessages([{ id: createId(), role: 'gm', text: INITIAL_GREETING }]);
    speakFor(INITIAL_GREETING);
  }, [speakFor]);

  const handleSend = (text: string, attachment?: ChatAttachment) => {
    setMessages((current) => [
      ...current,
      {
        id: createId(),
        role: 'user',
        text: text || (attachment ? '説明書です' : ''),
        attachment,
      },
    ]);

    if (replyTimerRef.current) {
      window.clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }

    if (attachment) {
      sayGm('ありがとうございます。確認しています...');
      replyTimerRef.current = window.setTimeout(() => {
        sayGm(`${describeAttachment(attachment)}というゲームですね、では始めましょう。`);
        replyTimerRef.current = null;
      }, 1800);
      return;
    }

    const requestedGameId = gameIdFromText(text);
    if (requestedGameId) {
      setExpression('neutral');
      setSelectedGameId(requestedGameId);
      const gameName = gameById.get(requestedGameId)?.meta.name ?? 'そのゲーム';
      sayGm(`${gameName}ですね。準備をお伺いします。`);
      return;
    }

    if (selectedGameId) {
      if (text.includes('中断')) {
        resetToOpening();
        return;
      }
      sayGm('進行中です。下のアクションから操作してください。中断したい場合は「中断」と送ってください。');
      return;
    }

    sayGm(
      '申し訳ありません、現時点で内蔵対応しているのは『すごろく』と『数字読み当て』です。他のゲームは説明書写真からの読み取り対応を準備中です。'
    );
  };

  return (
    <div className="app">
      <GmStage speaking={gmSpeaking} expression={expression} />
      <ChatPanel
        messages={messages}
        actionArea={
          selectedGame ? (
            <GamePlay
              key={selectedGame.meta.id}
              game={selectedGame}
              onExit={resetToOpening}
              onGmMessage={sayGm}
              onExpressionChange={setExpression}
            />
          ) : null
        }
        inputArea={<ChatInput onSend={handleSend} />}
      />
    </div>
  );
}

interface GamePlayProps {
  game: GameDefinition;
  onExit: () => void;
  onGmMessage: (message: string) => void;
  onExpressionChange: (expression: 'neutral' | 'win' | 'lose') => void;
}

function GamePlay({ game, onExit, onGmMessage, onExpressionChange }: GamePlayProps) {
  const [state, send] = useMachine(game.machine);
  const [questionOpen, setQuestionOpen] = useState(false);
  const lastMessageRef = useRef('');

  useEffect(() => {
    saveProgress({
      gameId: game.meta.id,
      stateName: JSON.stringify(state.value),
      context: state.context,
      savedAt: Date.now(),
    });
  }, [game.meta.id, state.value, state.context]);

  const message = useMemo(
    () => game.messageFor(state.value, state.context),
    [game, state.value, state.context]
  );

  useEffect(() => {
    if (!message || lastMessageRef.current === message) return;
    lastMessageRef.current = message;
    onGmMessage(message);
  }, [message, onGmMessage]);

  const path = stringifyState(state.value);
  const isResult = path === 'win' || path === 'lose';
  const isSugoroku = game.meta.id === 'sugoroku';
  const isNumberHunt = game.meta.id === 'numberHunt';
  const resultSquare: SquareKind | null = state.matches({ playing: 'starHit' })
    ? 'star'
    : state.matches({ playing: 'holeHit' })
      ? 'hole'
      : state.matches({ playing: 'normalHit' })
        ? 'normal'
        : null;
  const expression = state.matches('win') ? 'win' : state.matches('lose') ? 'lose' : 'neutral';

  useEffect(() => {
    onExpressionChange(expression);
  }, [expression, onExpressionChange]);

  const onBack = () => {
    if (path === 'setupPlayers') {
      onExit();
      return;
    }
    send({ type: 'BACK' } as never);
  };

  const onCancel = () => {
    clearProgress();
    send({ type: 'CANCEL' } as never);
    onExit();
  };

  return (
    <div className="game-action-stack">
      {isSugoroku && (
        <GameBoard
          context={state.context as SugorokuContext}
          active={!isResult}
          result={resultSquare}
        />
      )}
      {isNumberHunt && (
        <NumberHuntBoard
          context={state.context as NumberHuntContext}
          active={!isResult}
        />
      )}
      <ActionPanel
        gameId={game.meta.id}
        stateValue={state.value}
        context={state.context}
        onStart={() => send({ type: 'START' } as never)}
        onSetPlayers={(n) => send({ type: 'SET_PLAYERS', players: n } as never)}
        onNext={() => send({ type: 'NEXT' } as never)}
        onRoll={(v) => send({ type: 'ROLL', value: v } as never)}
        onGuess={(v) => send({ type: 'GUESS', value: v } as never)}
        onReset={() => send({ type: 'RESET' } as never)}
      />

      {isSugoroku && (
        <div className="status">
          <span>位置: {(state.context as SugorokuContext).position + 1}/12</span>
          <span>クリスタル: {(state.context as SugorokuContext).crystals}/3</span>
          <span>ラウンド: {(state.context as SugorokuContext).round}/6</span>
        </div>
      )}
      {isNumberHunt && (
        <div className="status">
          <span>範囲: {(state.context as NumberHuntContext).low}〜{(state.context as NumberHuntContext).high}</span>
          <span>手番: P{(state.context as NumberHuntContext).currentPlayer}</span>
          <span>ターン: {(state.context as NumberHuntContext).turn}/5</span>
        </div>
      )}

      <ControlBar
        onBack={onBack}
        onSkip={() => send({ type: 'SKIP' } as never)}
        onQuestion={() => setQuestionOpen(true)}
        onCancel={onCancel}
        disabledBack={false}
        disabledSkip={isResult}
      />

      <QuestionPanel
        open={questionOpen}
        onClose={() => setQuestionOpen(false)}
      />
    </div>
  );
}
