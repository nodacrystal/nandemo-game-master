import { createMachine, assign } from 'xstate';

export type GuessResult = 'higher' | 'lower' | 'hit';

export interface NumberHuntContext {
  players: number;
  currentPlayer: number;
  turn: number;
  secret: number;
  lastGuess: number | null;
  lastResult: GuessResult | null;
  low: number;
  high: number;
  skippedSteps: string[];
}

export const MIN_NUMBER = 1;
export const MAX_NUMBER = 30;
export const MAX_TURNS = 5;

const chooseSecret = () => Math.floor(Math.random() * MAX_NUMBER) + MIN_NUMBER;

const initialContext: NumberHuntContext = {
  players: 2,
  currentPlayer: 1,
  turn: 1,
  secret: chooseSecret(),
  lastGuess: null,
  lastResult: null,
  low: MIN_NUMBER,
  high: MAX_NUMBER,
  skippedSteps: [],
};

export type NumberHuntEvent =
  | { type: 'START' }
  | { type: 'SET_PLAYERS'; players: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SKIP' }
  | { type: 'CANCEL' }
  | { type: 'GUESS'; value: number }
  | { type: 'RESET' };

function freshRound(players: number): NumberHuntContext {
  return {
    players,
    currentPlayer: 1,
    turn: 1,
    secret: chooseSecret(),
    lastGuess: null,
    lastResult: null,
    low: MIN_NUMBER,
    high: MAX_NUMBER,
    skippedSteps: [],
  };
}

export const numberHuntMachine = createMachine({
  id: 'numberHunt',
  initial: 'setupPlayers',
  types: {} as {
    context: NumberHuntContext;
    events: NumberHuntEvent;
  },
  context: initialContext,
  states: {
    setupPlayers: {
      on: {
        START: { target: 'setupPlayers' },
        SET_PLAYERS: {
          actions: assign({ players: ({ event }) => event.players }),
        },
        NEXT: {
          target: 'intro',
          actions: assign(({ context }) => freshRound(context.players)),
        },
        BACK: { target: 'setupPlayers' },
        SKIP: {
          target: 'guessing',
          actions: assign(({ context }) => ({
            ...freshRound(context.players),
            skippedSteps: [...context.skippedSteps, 'intro'],
          })),
        },
        CANCEL: { target: 'setupPlayers' },
      },
    },
    intro: {
      on: {
        NEXT: { target: 'guessing' },
        BACK: { target: 'setupPlayers' },
        SKIP: {
          target: 'guessing',
          actions: assign({
            skippedSteps: ({ context }) => [...context.skippedSteps, 'intro'],
          }),
        },
        CANCEL: { target: 'setupPlayers' },
      },
    },
    guessing: {
      on: {
        GUESS: {
          target: 'judging',
          actions: assign(({ context, event }) => {
            const result: GuessResult =
              event.value === context.secret
                ? 'hit'
                : event.value < context.secret
                  ? 'higher'
                  : 'lower';
            return {
              lastGuess: event.value,
              lastResult: result,
              low: result === 'higher' ? Math.max(context.low, event.value + 1) : context.low,
              high: result === 'lower' ? Math.min(context.high, event.value - 1) : context.high,
            };
          }),
        },
        BACK: { target: 'intro' },
        CANCEL: { target: 'setupPlayers' },
      },
    },
    judging: {
      always: [
        {
          guard: ({ context }) => context.lastResult === 'hit',
          target: 'win',
        },
        {
          guard: ({ context }) => context.turn >= MAX_TURNS,
          target: 'lose',
        },
        { target: 'hint' },
      ],
    },
    hint: {
      on: {
        NEXT: {
          target: 'guessing',
          actions: assign(({ context }) => {
            const nextPlayer = (context.currentPlayer % context.players) + 1;
            return {
              currentPlayer: nextPlayer,
              turn: context.turn + 1,
            };
          }),
        },
        SKIP: {
          target: 'guessing',
          actions: assign(({ context }) => {
            const nextPlayer = (context.currentPlayer % context.players) + 1;
            return {
              currentPlayer: nextPlayer,
              turn: context.turn + 1,
              skippedSteps: [...context.skippedSteps, 'hint'],
            };
          }),
        },
        BACK: { target: 'guessing' },
        CANCEL: { target: 'setupPlayers' },
      },
    },
    win: {
      on: {
        RESET: {
          target: 'setupPlayers',
          actions: assign(({ context }) => freshRound(context.players)),
        },
      },
    },
    lose: {
      on: {
        RESET: {
          target: 'setupPlayers',
          actions: assign(({ context }) => freshRound(context.players)),
        },
      },
    },
  },
});
