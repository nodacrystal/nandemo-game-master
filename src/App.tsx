import { useEffect, useMemo, useState } from 'react';
import { useMachine } from '@xstate/react';
import { gameMachine } from './machines/gameMachine';
import { messageFor } from './lib/gmMessages';
import { saveProgress, loadProgress, clearProgress } from './lib/storage';
import { GmFace } from './components/GmFace';
import { MessageWindow } from './components/MessageWindow';
import { ActionPanel } from './components/ActionPanel';
import { ControlBar } from './components/ControlBar';
import { QuestionPanel } from './components/QuestionPanel';
import { GameBoard } from './components/GameBoard';
import './App.css';

export default function App() {
  const [state, send] = useMachine(gameMachine);
  const [askResume, setAskResume] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceUnlocked, setVoiceUnlocked] = useState(false);

  useEffect(() => {
    const saved = loadProgress();
    if (saved) setAskResume(true);
  }, []);

  useEffect(() => {
    saveProgress({
      stateName: JSON.stringify(state.value),
      context: state.context,
      savedAt: Date.now(),
    });
  }, [state.value, state.context]);

  const message = useMemo(
    () => messageFor(state.value, state.context),
    [state.value, state.context]
  );

  useEffect(() => {
    if (!message) return;
    if (voiceEnabled && voiceUnlocked && 'speechSynthesis' in window) return;

    setSpeaking(true);
    const t = setTimeout(() => setSpeaking(false), 1200);
    return () => clearTimeout(t);
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
    send({ type: 'CANCEL' });
  };

  const isTitle = state.matches('title');
  const isPlaying = state.matches('playing') || state.matches('win') || state.matches('lose');
  const resultSquare = state.matches({ playing: 'starHit' })
    ? 'star'
    : state.matches({ playing: 'holeHit' })
      ? 'hole'
      : state.matches({ playing: 'normalHit' })
        ? 'normal'
        : null;
  const expression = state.matches('win') ? 'win' : state.matches('lose') ? 'lose' : 'neutral';

  return (
    <div className="app">
      {askResume && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-title">続きから遊びますか?</div>
            <div className="modal-actions">
              <button onClick={() => setAskResume(false)}>続きから</button>
              <button
                onClick={() => {
                  clearProgress();
                  send({ type: 'RESET' });
                  setAskResume(false);
                }}
              >
                最初から
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="header">
        <h1>なんでもゲームマスター</h1>
        <div className="subtitle">12マス協力すごろく ベータ</div>
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
      </header>

      <GmFace speaking={speaking} expression={expression} />
      <MessageWindow message={message} />
      {!isTitle && (
        <GameBoard context={state.context} active={isPlaying} result={resultSquare} />
      )}
      <ActionPanel
        stateValue={state.value}
        context={state.context}
        onStart={() => send({ type: 'START' })}
        onSetPlayers={(n) => send({ type: 'SET_PLAYERS', players: n })}
        onNext={() => send({ type: 'NEXT' })}
        onRoll={(v) => send({ type: 'ROLL', value: v })}
        onReset={() => send({ type: 'RESET' })}
      />

      {!isTitle && (
        <div className="status">
          <span>位置: {state.context.position + 1}/12</span>
          <span>クリスタル: {state.context.crystals}/3</span>
          <span>ラウンド: {state.context.round}/6</span>
        </div>
      )}

      <ControlBar
        onBack={() => send({ type: 'BACK' })}
        onSkip={() => send({ type: 'SKIP' })}
        onQuestion={() => setQuestionOpen(true)}
        onCancel={onCancel}
        disabledBack={isTitle}
        disabledSkip={isTitle || state.matches('win') || state.matches('lose')}
      />

      <QuestionPanel
        open={questionOpen}
        onClose={() => setQuestionOpen(false)}
      />
    </div>
  );
}
