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
import './App.css';

export default function App() {
  const [state, send] = useMachine(gameMachine);
  const [askResume, setAskResume] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);

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
    setSpeaking(true);
    const t = setTimeout(() => setSpeaking(false), 1200);
    return () => clearTimeout(t);
  }, [message]);

  const onCancel = () => {
    clearProgress();
    send({ type: 'CANCEL' });
  };

  const isTitle = state.matches('title');

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
      </header>

      <GmFace speaking={speaking} />
      <MessageWindow message={message} />
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
