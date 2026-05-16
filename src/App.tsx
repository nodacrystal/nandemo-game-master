import { useEffect, useMemo, useState } from 'react';
import { useMachine } from '@xstate/react';
import { saveProgress, loadProgress, clearProgress } from './lib/storage';
import { gameById, games } from './games/registry';
import { stringifyState, type GameDefinition } from './games/types';
import type { NumberHuntContext } from './games/numberHunt/machine';
import type { SugorokuContext, SquareKind } from './games/sugoroku/machine';
import { GmFace } from './components/GmFace';
import { MessageWindow } from './components/MessageWindow';
import { ActionPanel } from './components/ActionPanel';
import { ControlBar } from './components/ControlBar';
import { QuestionPanel } from './components/QuestionPanel';
import { GameBoard } from './components/GameBoard';
import { GameSelect } from './components/GameSelect';
import { NumberHuntBoard } from './components/NumberHuntBoard';
import './App.css';

export default function App() {
  const [initialResumeGameId] = useState(() => {
    const saved = loadProgress();
    return saved?.gameId && gameById.has(saved.gameId) ? saved.gameId : null;
  });
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [askResume, setAskResume] = useState(Boolean(initialResumeGameId));
  const [resumeGameId, setResumeGameId] = useState<string | null>(initialResumeGameId);

  const selectedGame = selectedGameId ? gameById.get(selectedGameId) : null;

  return (
    <div className="app">
      {askResume && resumeGameId && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-title">前回のゲームを開きますか?</div>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setSelectedGameId(resumeGameId);
                  setAskResume(false);
                }}
              >
                開く
              </button>
              <button
                onClick={() => {
                  clearProgress();
                  setAskResume(false);
                  setResumeGameId(null);
                }}
              >
                開かない
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="header">
        <h1>なんでもゲームマスター</h1>
        <div className="subtitle">
          {selectedGame ? selectedGame.meta.name : 'ゲーム選択'}
        </div>
      </header>

      {selectedGame ? (
        <GamePlay
          key={selectedGame.meta.id}
          game={selectedGame}
          onExit={() => {
            clearProgress();
            setSelectedGameId(null);
          }}
        />
      ) : (
        <GameSelect games={games.map((game) => game.meta)} onSelect={setSelectedGameId} />
      )}
    </div>
  );
}

interface GamePlayProps {
  game: GameDefinition;
  onExit: () => void;
}

function GamePlay({ game, onExit }: GamePlayProps) {
  const [state, send] = useMachine(game.machine);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceUnlocked, setVoiceUnlocked] = useState(false);

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
    if (!message) return;
    if (voiceEnabled && voiceUnlocked && 'speechSynthesis' in window) return;

    const start = setTimeout(() => setSpeaking(true), 0);
    const stop = setTimeout(() => setSpeaking(false), 1200);
    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [message, voiceEnabled, voiceUnlocked]);

  useEffect(() => {
    const unlock = () => setVoiceUnlocked(true);
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    if (!message || !voiceEnabled || !voiceUnlocked || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.92;
    utterance.pitch = 0.86;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [message, voiceEnabled, voiceUnlocked]);

  const onCancel = () => {
    clearProgress();
    send({ type: 'CANCEL' } as never);
    onExit();
  };

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

  const onBack = () => {
    if (path === 'setupPlayers') {
      onExit();
      return;
    }
    send({ type: 'BACK' } as never);
  };

  return (
    <>
      <button
        className={`voice-toggle ${voiceEnabled ? 'active' : ''}`}
        type="button"
        onClick={() => {
          window.speechSynthesis?.cancel();
          setSpeaking(false);
          setVoiceEnabled((enabled) => !enabled);
          setVoiceUnlocked(true);
        }}
        aria-pressed={voiceEnabled}
      >
        {voiceEnabled ? '音声ON' : '音声OFF'}
      </button>

      <GmFace speaking={speaking} expression={expression} />
      <MessageWindow message={message} />
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
    </>
  );
}
